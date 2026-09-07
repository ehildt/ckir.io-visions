import { describe, expect, it, vi } from 'vitest';

import type { MemoryPoint } from '../../qdrant/models/memory.model.js';

import { MemorySearchService } from './memory-search.service.js';

function makeHit(id: string, score: number, text = id): MemoryPoint {
  return {
    id,
    score,
    text,
    role: 'user',
    memoryPartition: 'sess-1',
    sessionId: 'sess-1',
    tags: [],
    createdAt: '2026-08-21T08:00:00.000Z',
  };
}

function makeService() {
  const embed = vi.fn();
  const searchMemory = vi.fn().mockResolvedValue([] as MemoryPoint[]);
  const findByIds = vi.fn().mockResolvedValue([]);
  const service = new MemorySearchService(
    { embed } as never,
    { searchMemory } as never,
    { findByIds } as never,
    { searchSynopses: vi.fn().mockResolvedValue([]) } as never,
    {
      getRaptorEnabled: vi.fn().mockReturnValue(false),
      getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
    } as never,
  );
  return { service, embed, searchMemory, findByIds };
}

describe('MemorySearchService.searchByText', () => {
  it('embeds full text + sentence variants and merges by best score', async () => {
    const { service, embed, searchMemory } = makeService();
    // Variants: [full, 'Long question about memory.', 'Second part.']
    embed.mockImplementation((inputs: string[]) =>
      Promise.resolve(inputs.map((_, i) => (i === 0 ? [1, 0, 0] : [2, 0, 0]))),
    );
    // The full-text variant ranks A at 0.9; the sentence variants find B (0.8)
    // which the full-text query missed, and A again at a lower score.
    searchMemory.mockImplementation(
      async ({ vector }: { vector: number[] }) => {
        if (vector[0] === 1) return [makeHit('A', 0.9), makeHit('C', 0.7)];
        return [makeHit('A', 0.6), makeHit('B', 0.8)];
      },
    );

    const results = await service.searchByText({
      memoryPartition: 'sess-1',
      sessionId: 'sess-1',
      text: 'Long question about memory. Second part.',
      limit: 3,
      tags: ['work'],
    });

    expect(embed).toHaveBeenCalledWith(expect.any(Array), 'query');
    // A appears twice → keeps the max score (0.9), sorted desc, top 3.
    expect(results.map((r) => r.id)).toEqual(['A', 'B', 'C']);
    expect(results[0].score).toBe(0.9);
    // Filters threaded into every variant search.
    expect(
      searchMemory.mock.calls.every(([input]) => input.tags?.[0] === 'work'),
    ).toBe(true);
    expect(searchMemory).toHaveBeenCalledTimes(3);
  });

  it('threads the category filter into every variant search', async () => {
    const { service, embed, searchMemory } = makeService();
    embed.mockResolvedValue([[1, 0, 0]]);
    searchMemory.mockResolvedValue([]);

    await service.searchByText({
      memoryPartition: 'sess-1',
      text: 'One sentence.',
      category: 'games',
    });

    expect(
      searchMemory.mock.calls.every(([input]) => input.category === 'games'),
    ).toBe(true);
  });

  it('degrades to empty when the embed fails', async () => {
    const { service, embed, searchMemory } = makeService();
    embed.mockRejectedValue(new Error('embed down'));

    expect(
      await service.searchByText({
        sessionId: 'sess-1',
        text: 'anything',
      }),
    ).toEqual([]);
    expect(searchMemory).not.toHaveBeenCalled();
  });

  it('degrades to empty on an embed count mismatch', async () => {
    const { service, embed, searchMemory } = makeService();
    embed.mockResolvedValue([[1, 0, 0]]); // one vector for two variants

    expect(
      await service.searchByText({
        sessionId: 'sess-1',
        text: 'Two sentences. Here.',
      }),
    ).toEqual([]);
    expect(searchMemory).not.toHaveBeenCalled();
  });

  it('returns nothing for blank input', async () => {
    const { service, embed } = makeService();
    expect(
      await service.searchByText({
        sessionId: 'sess-1',
        text: '  ',
      }),
    ).toEqual([]);
    expect(embed).not.toHaveBeenCalled();
  });
});

describe('MemorySearchService.searchByVector', () => {
  it('passes all filters to the repository search', async () => {
    const { service, searchMemory } = makeService();
    searchMemory.mockResolvedValue([makeHit('a', 0.7)]);

    await service.searchByVector({
      memoryPartition: 'sess-1',
      sessionId: 'sess-1',
      vector: [1, 0, 0],
      role: 'user',
      conversationId: 'conv-9',
      tags: ['work'],
      contains: 'phone',
    });

    expect(searchMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        memoryPartition: 'sess-1',
        sessionId: 'sess-1',
        role: 'user',
        conversationId: 'conv-9',
        tags: ['work'],
        contains: 'phone',
      }),
    );
  });
});

describe('MemorySearchService clusters', () => {
  it('attaches cluster summaries to text-search hits', async () => {
    const { service, embed, searchMemory, findByIds } = makeService();
    embed.mockResolvedValue([[1, 0, 0]]);
    searchMemory.mockResolvedValue([
      { ...makeHit('a', 0.7), clusterId: 'cl-1' },
      makeHit('b', 0.5),
    ]);
    findByIds.mockResolvedValue([
      { id: 'cl-1', title: 'Cars', summary: 'All about cars' },
    ]);

    const result = await service.searchByTextWithClusters({
      memoryPartition: 'sess-1',
      text: 'cars',
    });

    expect(result.points).toHaveLength(2);
    expect(result.clusters).toEqual([
      { id: 'cl-1', title: 'Cars', summary: 'All about cars' },
    ]);
    expect(findByIds).toHaveBeenCalledWith(['cl-1']);
  });

  it('attaches clusters to vector-search hits', async () => {
    const { service, searchMemory, findByIds } = makeService();
    searchMemory.mockResolvedValue([
      { ...makeHit('a', 0.7), clusterId: 'cl-1' },
    ]);
    findByIds.mockResolvedValue([]);

    const result = await service.searchByVectorWithClusters({
      memoryPartition: 'sess-1',
      vector: [1, 0, 0],
    });

    expect(result.points).toHaveLength(1);
    expect(result.clusters).toEqual([]);
  });
});

describe('MemorySearchService.searchSynopses', () => {
  it('returns empty when raptor is disabled', async () => {
    const { service, embed } = makeService();

    const hits = await service.searchSynopses({
      memoryPartition: 'sess-1',
      text: 'cars',
    });

    expect(hits).toEqual([]);
    expect(embed).not.toHaveBeenCalled();
  });

  it('searches the partition synopsis lane when raptor is enabled', async () => {
    const embed = vi.fn().mockResolvedValue([[1, 0, 0]]);
    const searchSynopses = vi
      .fn()
      .mockResolvedValue([{ id: 's1', text: 'synopsis', score: 0.8 }]);
    const service = new MemorySearchService(
      { embed } as never,
      { searchMemory: vi.fn() } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses, incrementHeat: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(true),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
      } as never,
    );

    const hits = await service.searchSynopses({
      memoryPartition: 'sess-1',
      text: 'cars',
      limit: 3,
    });

    expect(searchSynopses).toHaveBeenCalledWith(
      'partition',
      'sess-1',
      [1, 0, 0],
      3,
    );
    expect(hits).toHaveLength(1);
  });

  it('searches the encyclopedia lane when no partition is given', async () => {
    const embed = vi.fn().mockResolvedValue([[1, 0, 0]]);
    const searchSynopses = vi.fn().mockResolvedValue([]);
    const service = new MemorySearchService(
      { embed } as never,
      { searchMemory: vi.fn() } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses, incrementHeat: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(true),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
      } as never,
    );

    await service.searchSynopses({ text: 'cars' });

    expect(searchSynopses).toHaveBeenCalledWith(
      'encyclopedia',
      'global',
      [1, 0, 0],
      2,
    );
  });

  it('increments synopsis heat when heat tracking is enabled', async () => {
    const embed = vi.fn().mockResolvedValue([[1, 0, 0]]);
    const incrementHeat = vi.fn().mockResolvedValue(undefined);
    const service = new MemorySearchService(
      { embed } as never,
      { searchMemory: vi.fn() } as never,
      { findByIds: vi.fn() } as never,
      {
        searchSynopses: vi
          .fn()
          .mockResolvedValue([{ id: 's1', text: 'x', score: 0.5 }]),
        incrementHeat,
      } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(true),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(true),
      } as never,
    );

    await service.searchSynopses({ text: 'cars' });

    expect(incrementHeat).toHaveBeenCalled();
  });

  it('degrades to empty when the embed fails', async () => {
    const embed = vi.fn().mockRejectedValue(new Error('down'));
    const service = new MemorySearchService(
      { embed } as never,
      { searchMemory: vi.fn() } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(true),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
      } as never,
    );

    expect(await service.searchSynopses({ text: 'cars' })).toEqual([]);
  });
});

describe('MemorySearchService.searchBridges and searchConvictions', () => {
  it('searches bridges with the embedded query', async () => {
    const embed = vi.fn().mockResolvedValue([[1, 0, 0]]);
    const searchBridges = vi.fn().mockResolvedValue([makeHit('b1', 0.6)]);
    const service = new MemorySearchService(
      { embed } as never,
      { searchBridges } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(false),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
      } as never,
    );

    const hits = await service.searchBridges({
      memoryPartition: 'sess-1',
      text: 'gap',
    });

    expect(searchBridges).toHaveBeenCalledWith({
      memoryPartition: 'sess-1',
      vector: [1, 0, 0],
      limit: 5,
    });
    expect(hits).toHaveLength(1);
  });

  it('searches convictions with the embedded query', async () => {
    const embed = vi.fn().mockResolvedValue([[1, 0, 0]]);
    const searchConvictions = vi.fn().mockResolvedValue([makeHit('c1', 0.6)]);
    const service = new MemorySearchService(
      { embed } as never,
      { searchConvictions } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(false),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
      } as never,
    );

    const hits = await service.searchConvictions({
      memoryCognition: 'cog-1',
      text: 'conclusion',
    });

    expect(searchConvictions).toHaveBeenCalledWith({
      memoryCognition: 'cog-1',
      vector: [1, 0, 0],
      limit: 5,
    });
    expect(hits).toHaveLength(1);
  });

  it('degrades to empty when the embed fails', async () => {
    const embed = vi.fn().mockRejectedValue(new Error('down'));
    const service = new MemorySearchService(
      { embed } as never,
      { searchBridges: vi.fn() } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(false),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(false),
      } as never,
    );

    expect(
      await service.searchBridges({ memoryPartition: 'sess-1', text: 'x' }),
    ).toEqual([]);
  });
});

describe('MemorySearchService heat tracking', () => {
  it('increments heat on hits when heat tracking is enabled', async () => {
    const embed = vi.fn().mockResolvedValue([[1, 0, 0]]);
    const searchMemory = vi.fn().mockResolvedValue([makeHit('a', 0.7)]);
    const incrementHeat = vi.fn().mockResolvedValue(undefined);
    const service = new MemorySearchService(
      { embed } as never,
      { searchMemory, incrementHeat } as never,
      { findByIds: vi.fn() } as never,
      { searchSynopses: vi.fn() } as never,
      {
        getRaptorEnabled: vi.fn().mockReturnValue(false),
        getHeatTrackingEnabled: vi.fn().mockReturnValue(true),
      } as never,
    );

    await service.searchByText({
      memoryPartition: 'sess-1',
      text: 'cars',
    });

    expect(incrementHeat).toHaveBeenCalled();
  });

  it('skips heat tracking for bookkeeping probes', async () => {
    const { service, embed, searchMemory } = makeService();
    embed.mockResolvedValue([[0, 0, 1]]);
    searchMemory.mockResolvedValue([makeHit('a', 0.7)]);

    const result = await service.searchByText({
      memoryPartition: 'sess-1',
      text: 'cars',
      trackHeat: false,
    });

    expect(result).toHaveLength(1);
    expect(searchMemory).toHaveBeenCalled();
  });
});
