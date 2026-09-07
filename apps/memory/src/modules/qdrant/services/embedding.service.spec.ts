import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EmbeddingService } from './embedding.service.js';

const qdrantConfig = {
  embedModel: 'nomic-embed-text',
  embedTimeoutMs: 30_000,
};

function makeService() {
  return new EmbeddingService(
    {
      getConfig: vi.fn().mockReturnValue({
        host: 'http://ollama:11434',
        apiKey: undefined,
      }),
    } as never,
    { config: { keepAlive: '5m' } } as never,
    qdrantConfig as never,
  );
}

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    service = makeService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('embeds a single string with the role prefix', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ embeddings: [[0.1, 0.2]] }),
    });

    const vectors = await service.embed('some text', 'document');

    expect(vectors).toEqual([[0.1, 0.2]]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://ollama:11434/embed');
    const body = JSON.parse(init.body);
    expect(body.model).toBe('nomic-embed-text');
    expect(body.input).toContain('some text');
  });

  it('embeds an array of strings with per-item prefixes', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ embeddings: [[0.1], [0.2]] }),
    });

    const vectors = await service.embed(['a', 'b'], 'query');

    expect(vectors).toHaveLength(2);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.input).toHaveLength(2);
  });

  it('throws an EmbeddingFailureError on a non-ok response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    await expect(service.embed('text', 'document')).rejects.toThrow(
      'Ollama embed failed (500)',
    );
  });

  it('returns the embedding dimension from a probe', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ embeddings: [[0.1, 0.2, 0.3]] }),
    });

    const dim = await service.embedDimension();

    expect(dim).toBe(3);
  });

  it('throws when the probe returns an empty vector', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ embeddings: [[]] }),
    });

    await expect(service.embedDimension()).rejects.toThrow(
      'Embedding probe returned an empty vector',
    );
  });

  it('reports the model ready when it is in the tags list', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: 'nomic-embed-text:latest' }] }),
    });

    expect(await service.isModelReady()).toBe(true);
  });

  it('reports the model not ready when it is missing from the tags list', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: 'llama3' }] }),
    });

    expect(await service.isModelReady()).toBe(false);
  });

  it('reports the model not ready on a non-ok tags response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    expect(await service.isModelReady()).toBe(false);
  });

  it('reports the model not ready when the tags call throws', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    expect(await service.isModelReady()).toBe(false);
  });
});
