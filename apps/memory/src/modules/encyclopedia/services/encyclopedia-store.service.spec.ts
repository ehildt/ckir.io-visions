import { hashPayload } from '@triplef/helpers/hash-payload';
import { describe, expect, it, vi } from 'vitest';

import { EncyclopediaStoreService } from './encyclopedia-store.service.js';

function makeService(maxDocumentChars = 4_000_000) {
  const repository = {
    scrollByUrl: vi.fn().mockResolvedValue([]),
    upsertChunks: vi.fn().mockResolvedValue(undefined),
    deleteByUrlExcludingHash: vi.fn().mockResolvedValue(undefined),
  };
  const ledger = {
    insertMany: vi.fn().mockResolvedValue(undefined),
    countPending: vi.fn().mockResolvedValue(0),
    countPendingClassification: vi.fn().mockResolvedValue(0),
  };
  const embedding = {
    embed: vi
      .fn()
      .mockImplementation((chunks: string[]) =>
        Promise.resolve(chunks.map(() => [0.1, 0.2, 0.3])),
      ),
  };
  const memoryEnqueue = {
    enqueueEncyclopediaSweep: vi.fn().mockResolvedValue(undefined),
    enqueueEncyclopediaClassify: vi.fn().mockResolvedValue(undefined),
  };
  const overrides = {
    getClassifyModel: vi.fn().mockReturnValue(undefined),
  };
  const config = {
    maxDocumentChars,
    chunkChars: 1600,
    chunkOverlapSentences: 1,
    consolidateThreshold: 200,
    classifyThreshold: 20,
    classifyModel: undefined,
  };
  const service = new EncyclopediaStoreService(
    repository as never,
    ledger as never,
    embedding as never,
    memoryEnqueue as never,
    overrides as never,
    config as never,
  );
  return { service, repository, ledger, embedding, memoryEnqueue, overrides };
}

describe('EncyclopediaStoreService.persistDocuments', () => {
  it('persists url-less documents under a synthetic upload url when allowUrlless', async () => {
    const { service, repository } = makeService();

    const outcome = await service.persistDocuments(
      [{ title: 'Upload', content: 'A url-less upload body.' }],
      'global',
      undefined,
      true,
    );

    expect(outcome.storedDocs).toBe(1);
    expect(outcome.ephemeralDocs).toHaveLength(0);
    expect(repository.upsertChunks).toHaveBeenCalledTimes(1);
    const points = repository.upsertChunks.mock.calls[0][0] as Array<{
      url: string;
      id: string;
    }>;
    expect(points[0].url).toMatch(/^upload:[0-9a-f]{64}$/);
    expect(points[0].id).toBeTruthy();

    // Idempotent: re-uploading the same content reproduces the same
    // deterministic id, so the point overwrites in place (no duplicates).
    repository.upsertChunks.mockClear();
    const again = await service.persistDocuments(
      [{ title: 'Upload', content: 'A url-less upload body.' }],
      'global',
      undefined,
      true,
    );
    expect(again.storedDocs).toBe(1);
    const rePoints = repository.upsertChunks.mock.calls[0][0] as Array<{
      id: string;
    }>;
    expect(rePoints[0].id).toBe(points[0].id);
  });

  it('reports an oversized document as rejected (reason: oversize)', async () => {
    const { service, repository } = makeService(10);

    const outcome = await service.persistDocuments(
      [
        {
          url: 'https://example.com/big',
          title: 'Big',
          content: 'x'.repeat(100),
        },
      ],
      'global',
      undefined,
      true,
    );

    expect(outcome.storedDocs).toBe(0);
    expect(outcome.rejectedDocs).toEqual([
      { title: 'Big', url: 'https://example.com/big', reason: 'oversize' },
    ]);
    expect(repository.upsertChunks).not.toHaveBeenCalled();
  });

  it('reports an unchunkable document as rejected (reason: empty)', async () => {
    const { service, repository } = makeService();

    const outcome = await service.persistDocuments(
      [{ title: 'Empty', content: '' }],
      'global',
      undefined,
      true,
    );

    expect(outcome.storedDocs).toBe(0);
    expect(outcome.rejectedDocs).toEqual([
      {
        title: 'Empty',
        url: expect.stringMatching(/^upload:/),
        reason: 'empty',
      },
    ]);
    expect(repository.upsertChunks).not.toHaveBeenCalled();
  });

  it('treats url-less documents as ephemeral in the select flow (default)', async () => {
    const { service, repository } = makeService();

    const outcome = await service.persistDocuments(
      [{ title: 'Upload', content: 'A url-less upload body.' }],
      'global',
    );

    expect(outcome.storedDocs).toBe(0);
    expect(outcome.ephemeralDocs).toHaveLength(1);
    expect(repository.upsertChunks).not.toHaveBeenCalled();
  });

  it('reuses an unchanged url-keyed document by content hash', async () => {
    const { service, repository } = makeService();
    const content = 'unchanged';
    repository.scrollByUrl.mockResolvedValue([
      {
        contentHash: hashPayload(content),
        fetchedAt: '2025-01-01T00:00:00.000Z',
      },
    ]);

    const outcome = await service.persistDocuments(
      [{ url: 'https://example.com/a', content }],
      'global',
    );

    expect(outcome.reusedDocs).toBe(1);
    expect(outcome.storedDocs).toBe(0);
    expect(repository.upsertChunks).not.toHaveBeenCalled();
  });

  it('stores a changed url-keyed document and supersedes the old hash', async () => {
    const { service, repository, ledger } = makeService();
    const content = 'A changed document body with enough words to chunk.';
    repository.scrollByUrl.mockResolvedValue([
      {
        contentHash: 'old-hash',
        fetchedAt: '2025-01-01T00:00:00.000Z',
      },
    ]);

    const outcome = await service.persistDocuments(
      [{ url: 'https://example.com/a', title: 'A', content }],
      'global',
    );

    expect(outcome.storedDocs).toBe(1);
    expect(outcome.indexedUrls).toEqual(['https://example.com/a']);
    expect(repository.upsertChunks).toHaveBeenCalledTimes(1);
    expect(repository.deleteByUrlExcludingHash).toHaveBeenCalledWith(
      'https://example.com/a',
      hashPayload(content),
    );
    expect(ledger.insertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        url: 'https://example.com/a',
        contentHash: hashPayload(content),
        partitionScope: 'global',
        title: 'A',
      }),
    ]);
  });

  it('auto-triggers the encyclopedia sweep at the pending threshold', async () => {
    const { service, ledger, memoryEnqueue } = makeService();
    ledger.countPending.mockResolvedValue(200);

    await service.persistDocuments(
      [{ url: 'https://example.com/a', content: 'Some content here.' }],
      'global',
    );

    expect(memoryEnqueue.enqueueEncyclopediaSweep).toHaveBeenCalledWith({});
  });

  it('auto-triggers classification at the pending threshold', async () => {
    const { service, ledger, memoryEnqueue } = makeService();
    ledger.countPendingClassification.mockResolvedValue(20);

    await service.persistDocuments(
      [{ url: 'https://example.com/a', content: 'Some content here.' }],
      'global',
      'turn-model',
    );

    expect(memoryEnqueue.enqueueEncyclopediaClassify).toHaveBeenCalledWith({
      model: 'turn-model',
    });
  });

  it('continues when the ledger write fails', async () => {
    const { service, ledger, repository } = makeService();
    ledger.insertMany.mockRejectedValue(new Error('db down'));

    const outcome = await service.persistDocuments(
      [{ url: 'https://example.com/a', content: 'Some content here.' }],
      'global',
    );

    expect(outcome.storedDocs).toBe(1);
    expect(repository.upsertChunks).toHaveBeenCalled();
  });
});

describe('EncyclopediaStoreService.indexSearchResults', () => {
  it('indexes search results as snippet points', async () => {
    const { service, repository, embedding } = makeService();

    const urls = await service.indexSearchResults(
      [
        { url: 'https://example.com/1', title: 'One', snippet: 'snippet one' },
        { url: 'https://example.com/2', snippet: 'snippet two' },
      ],
      'global',
    );

    expect(urls).toEqual(['https://example.com/1', 'https://example.com/2']);
    expect(embedding.embed).toHaveBeenCalledWith(
      ['snippet one', 'snippet two'],
      'document',
    );
    expect(repository.upsertChunks).toHaveBeenCalledWith(expect.any(Array), {
      skipLinks: true,
    });
  });

  it('skips results without a url or snippet', async () => {
    const { service, repository, embedding } = makeService();

    const urls = await service.indexSearchResults(
      [
        { url: '', snippet: 'no url' },
        { url: 'https://example.com/3', snippet: '   ' },
      ],
      'global',
    );

    expect(urls).toEqual([]);
    expect(embedding.embed).not.toHaveBeenCalled();
    expect(repository.upsertChunks).not.toHaveBeenCalled();
  });

  it('uses the client override model for classification', async () => {
    const { service, memoryEnqueue, overrides } = makeService();
    overrides.getClassifyModel.mockReturnValue('override-model');

    await service.indexSearchResults(
      [{ url: 'https://example.com/1', snippet: 'snippet' }],
      'global',
    );

    expect(memoryEnqueue.enqueueEncyclopediaClassify).toHaveBeenCalledWith({
      model: 'override-model',
    });
  });

  it('skips classification when no model is available', async () => {
    const { service, memoryEnqueue } = makeService();

    await service.indexSearchResults(
      [{ url: 'https://example.com/1', snippet: 'snippet' }],
      'global',
    );

    expect(memoryEnqueue.enqueueEncyclopediaClassify).not.toHaveBeenCalled();
  });
});
