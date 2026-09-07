import { describe, expect, it, vi } from 'vitest';

import { deterministicPointId } from '../../qdrant/helpers/deterministic-point-id.helper.js';
import type { QdrantConfig } from '../../qdrant/models/qdrant-config.model.js';

import { MemoryCognitionService } from './memory-cognition.service.js';

function makeService(enabled = true) {
  const embeddingService = {
    embed: vi.fn().mockResolvedValue([[0.1, 0.2]]),
  };
  const memoryRepository = {
    listMemory: vi.fn().mockResolvedValue([]),
    upsertBatch: vi.fn().mockResolvedValue(undefined),
    deleteByIds: vi.fn().mockResolvedValue(undefined),
  };
  const profileRepository = {
    findBySpace: vi.fn().mockResolvedValue(undefined),
    upsert: vi.fn().mockResolvedValue(undefined),
    deleteBySpace: vi.fn().mockResolvedValue(undefined),
  };
  const service = new MemoryCognitionService(
    embeddingService as never,
    memoryRepository as never,
    profileRepository as never,
    { enabled } as QdrantConfig,
  );
  return { service, embeddingService, memoryRepository, profileRepository };
}

const scope = {
  memoryCognition: 'cog-1',
  sessionId: 'sess-1',
  conversationId: 'conv-1',
  requestId: 'req-1',
};

describe('MemoryCognitionService.getProfile', () => {
  it('returns the stored Postgres profile', async () => {
    const { service, profileRepository } = makeService();
    profileRepository.findBySpace.mockResolvedValue({
      profile: { likes: ['cars'] },
      updatedAt: new Date(),
    });

    const profile = await service.getProfile('cog-1');

    expect(profile).toEqual({ likes: ['cars'] });
  });

  it('migrates a legacy Qdrant profile point', async () => {
    const { service, profileRepository, memoryRepository } = makeService();
    memoryRepository.listMemory.mockResolvedValue([
      {
        id: 'legacy-1',
        text: JSON.stringify({ likes: ['cars'] }),
        sessionId: 'sess-1',
        conversationId: 'conv-1',
        requestId: 'req-1',
      },
    ]);

    const profile = await service.getProfile('cog-1');

    expect(profile).toEqual({ likes: ['cars'] });
    expect(profileRepository.upsert).toHaveBeenCalledWith(
      'cog-1',
      { likes: ['cars'] },
      {
        sessionId: 'sess-1',
        conversationId: 'conv-1',
        requestId: 'req-1',
      },
    );
    expect(memoryRepository.deleteByIds).toHaveBeenCalledWith(['legacy-1']);
  });

  it('returns undefined when the space has no profile', async () => {
    const { service } = makeService();

    const profile = await service.getProfile('cog-1');

    expect(profile).toBeUndefined();
  });
});

describe('MemoryCognitionService.hasInsights and listers', () => {
  it('reports whether the space holds insights', async () => {
    const { service, memoryRepository } = makeService();
    memoryRepository.listMemory.mockResolvedValue([{ id: 'i1' }]);

    expect(await service.hasInsights('cog-1')).toBe(true);
    expect(memoryRepository.listMemory).toHaveBeenCalledWith({
      memoryCognition: 'cog-1',
      tags: ['insight'],
      limit: 1,
    });
  });

  it('lists insights with the insight tag', async () => {
    const { service, memoryRepository } = makeService();

    await service.listInsights('cog-1', 5);

    expect(memoryRepository.listMemory).toHaveBeenCalledWith({
      memoryCognition: 'cog-1',
      tags: ['insight'],
      limit: 5,
    });
  });

  it('lists convictions with the conviction tag', async () => {
    const { service, memoryRepository } = makeService();

    await service.listConvictions('cog-1');

    expect(memoryRepository.listMemory).toHaveBeenCalledWith({
      memoryCognition: 'cog-1',
      tags: ['conviction'],
      limit: 100,
    });
  });
});

describe('MemoryCognitionService.storeProfile', () => {
  it('upserts the profile document', async () => {
    const { service, profileRepository } = makeService();

    const key = await service.storeProfile(scope, { likes: ['cars'] }, 1000);

    expect(key).toBe('cog-1');
    expect(profileRepository.upsert).toHaveBeenCalledWith(
      'cog-1',
      { likes: ['cars'] },
      {
        sessionId: 'sess-1',
        conversationId: 'conv-1',
        requestId: 'req-1',
      },
    );
  });

  it('throws when the profile exceeds the cap', async () => {
    const { service } = makeService();

    await expect(
      service.storeProfile(scope, { likes: ['x'.repeat(100)] }, 10),
    ).rejects.toThrow('exceeds the 10-character cap');
  });

  it('throws when the feature is disabled', async () => {
    const { service } = makeService(false);

    await expect(
      service.storeProfile(scope, { likes: ['cars'] }, 1000),
    ).rejects.toThrow('disabled');
  });
});

describe('MemoryCognitionService.upsertInsights', () => {
  it('embeds and stores insight points', async () => {
    const { service, embeddingService, memoryRepository } = makeService();

    const count = await service.upsertInsights(scope, [
      { text: 'likes vintage cars', path: 'likes.cars' },
    ]);

    expect(count).toBe(1);
    expect(embeddingService.embed).toHaveBeenCalledWith(
      ['likes vintage cars'],
      'document',
    );
    expect(memoryRepository.upsertBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        memoryCognition: 'cog-1',
        role: 'assistant',
        points: [
          expect.objectContaining({
            text: 'likes vintage cars',
            path: 'likes.cars',
          }),
        ],
      }),
    );
  });

  it('returns zero for empty insights', async () => {
    const { service, memoryRepository } = makeService();

    const count = await service.upsertInsights(scope, [
      { text: '   ', path: 'x' },
    ]);

    expect(count).toBe(0);
    expect(memoryRepository.upsertBatch).not.toHaveBeenCalled();
  });

  it('throws on an embed count mismatch', async () => {
    const { service, embeddingService } = makeService();
    embeddingService.embed.mockResolvedValue([]);

    await expect(
      service.upsertInsights(scope, [{ text: 'x', path: 'y' }]),
    ).rejects.toThrow('fewer vectors');
  });
});

describe('MemoryCognitionService.storeInsight', () => {
  it('stores one insight with a deterministic id', async () => {
    const { service, memoryRepository } = makeService();

    const id = await service.storeInsight(scope, {
      text: 'prefers concise answers',
      path: 'preferences.tone',
    });

    expect(id).toBe(
      deterministicPointId('cog-1|cognition|insight|prefers concise answers'),
    );
    expect(memoryRepository.upsertBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        points: [
          expect.objectContaining({
            text: 'prefers concise answers',
            path: 'preferences.tone',
          }),
        ],
      }),
    );
  });

  it('throws for empty insight text', async () => {
    const { service } = makeService();

    await expect(
      service.storeInsight(scope, { text: '   ', path: 'x' }),
    ).rejects.toThrow('insight text is empty');
  });
});

describe('MemoryCognitionService.upsertEpisode', () => {
  it('stores an episode with skipLinks', async () => {
    const { service, memoryRepository } = makeService();

    const count = await service.upsertEpisode(scope, 'discussed engine swaps');

    expect(count).toBe(1);
    expect(memoryRepository.upsertBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        memoryCognition: 'cog-1',
        skipLinks: true,
        points: [
          expect.objectContaining({
            text: 'discussed engine swaps',
            id: deterministicPointId('cog-1|cognition|episode|req-1'),
          }),
        ],
      }),
    );
  });

  it('returns zero for empty episodes', async () => {
    const { service, memoryRepository } = makeService();

    const count = await service.upsertEpisode(scope, '   ');

    expect(count).toBe(0);
    expect(memoryRepository.upsertBatch).not.toHaveBeenCalled();
  });
});

describe('MemoryCognitionService.deleteCognitionRecords', () => {
  it('deletes a verbatim insight and prunes a profile topic', async () => {
    const { service, memoryRepository, profileRepository } = makeService();
    memoryRepository.listMemory.mockResolvedValue([
      { id: 'i1', text: 'likes cars' },
    ]);
    profileRepository.findBySpace.mockResolvedValue({
      profile: { likes: ['cars', 'games'] },
      updatedAt: new Date(),
    });

    const outcome = await service.deleteCognitionRecords({
      memoryCognition: 'cog-1',
      text: 'likes cars',
      path: 'likes.cars',
    });

    expect(outcome.deleted).toBe(1);
    expect(outcome.texts).toEqual(['likes cars']);
    expect(outcome.pruned).toEqual(['cars']);
    expect(memoryRepository.deleteByIds).toHaveBeenCalledWith(['i1']);
    expect(profileRepository.upsert).toHaveBeenCalled();
  });

  it('returns an honest miss when nothing matches', async () => {
    const { service } = makeService();

    const outcome = await service.deleteCognitionRecords({
      memoryCognition: 'cog-1',
      text: 'nothing',
      path: 'likes.nothing',
    });

    expect(outcome).toEqual({ deleted: 0, texts: [], pruned: [] });
  });
});

describe('MemoryCognitionService.deleteCognition', () => {
  it('purges the whole space in batches', async () => {
    const { service, memoryRepository, profileRepository } = makeService();
    memoryRepository.listMemory
      .mockResolvedValueOnce([
        { id: 'i1', text: 'a' },
        { id: 'i2', text: 'b' },
      ])
      .mockResolvedValueOnce([]);

    const removed = await service.deleteCognition('cog-1');

    expect(removed).toEqual(['a', 'b']);
    expect(memoryRepository.deleteByIds).toHaveBeenCalledWith(['i1', 'i2']);
    expect(profileRepository.deleteBySpace).toHaveBeenCalledWith('cog-1');
  });
});
