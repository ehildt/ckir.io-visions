import { describe, expect, it, vi } from 'vitest';

import { TaxonomyProbeService } from './taxonomy-probe.service.js';

function makeNode(overrides: Record<string, unknown> = {}) {
  return {
    id: 'n1',
    lane: 'partition' as const,
    scopeKey: 'sess-1',
    kind: 'cluster' as const,
    parentId: 'root',
    name: 'Games',
    normalizedName: 'games',
    summary: 'Video games',
    icon: null,
    ...overrides,
  };
}

function makeService() {
  const taxonomy = {
    listNodes: vi.fn().mockResolvedValue([]),
    resolveAlias: vi.fn().mockResolvedValue(undefined),
  };
  const taxonomyVectors = {
    listExistingIds: vi.fn().mockResolvedValue(new Set()),
    searchLabels: vi.fn().mockResolvedValue([]),
    upsertLabelPoints: vi.fn().mockResolvedValue(undefined),
  };
  const embeddingService = {
    embed: vi.fn().mockResolvedValue([[0.1, 0.2]]),
  };
  const service = new TaxonomyProbeService(
    taxonomy as never,
    taxonomyVectors as never,
    embeddingService as never,
  );
  return { service, taxonomy, taxonomyVectors, embeddingService };
}

describe('TaxonomyProbeService.probe', () => {
  it('pins an exact normalized-name hit at the top', async () => {
    const { service, taxonomy } = makeService();
    taxonomy.listNodes.mockResolvedValue([makeNode()]);

    const result = await service.probe('partition', 'sess-1', {
      kind: 'cluster',
      query: 'games',
    });

    expect(result.candidates[0]).toMatchObject({
      id: 'n1',
      name: 'Games',
      score: 1,
    });
    expect(result.guidance).toContain('ADOPT one candidate');
  });

  it('pins an alias hit when the exact name is absent', async () => {
    const { service, taxonomy } = makeService();
    taxonomy.listNodes.mockResolvedValue([makeNode()]);
    taxonomy.resolveAlias.mockResolvedValue('n1');

    const result = await service.probe('partition', 'sess-1', {
      kind: 'cluster',
      query: 'gaming',
    });

    expect(result.candidates[0]).toMatchObject({ id: 'n1', score: 1 });
  });

  it('fuses trigram and semantic scores for the remaining candidates', async () => {
    const { service, taxonomy, taxonomyVectors } = makeService();
    taxonomy.listNodes.mockResolvedValue([
      makeNode({ id: 'n1', name: 'Games', normalizedName: 'games' }),
      makeNode({ id: 'n2', name: 'Cooking', normalizedName: 'cooking' }),
    ]);
    taxonomyVectors.searchLabels.mockResolvedValue([{ id: 'n2', score: 0.9 }]);

    const result = await service.probe('partition', 'sess-1', {
      kind: 'cluster',
      query: 'cooking',
    });

    // n2 scores high on both signals; n1 is excluded (pinned? no — the query
    // is 'cooking', so n1 is a fuzzy miss).
    const cooking = result.candidates.find((c) => c.id === 'n2');
    expect(cooking).toBeDefined();
    expect(cooking!.score).toBeGreaterThan(0.5);
  });

  it('returns create guidance when no candidates clear the floor', async () => {
    const { service, taxonomy } = makeService();
    taxonomy.listNodes.mockResolvedValue([makeNode()]);

    const result = await service.probe('partition', 'sess-1', {
      kind: 'cluster',
      query: 'quantum-physics',
    });

    expect(result.candidates).toHaveLength(0);
    expect(result.guidance).toContain('CREATE your label');
  });

  it('scopes candidates to the requested parent', async () => {
    const { service, taxonomy } = makeService();
    taxonomy.listNodes.mockResolvedValue([
      makeNode({
        id: 'n1',
        kind: 'community',
        parentId: 'games',
        name: 'Action',
        normalizedName: 'action',
      }),
      makeNode({
        id: 'n2',
        kind: 'community',
        parentId: 'other',
        name: 'Racing',
        normalizedName: 'racing',
      }),
    ]);

    const result = await service.probe('partition', 'sess-1', {
      kind: 'community',
      query: 'action',
      parentId: 'games',
    });

    expect(result.candidates.map((c) => c.id)).toEqual(['n1']);
  });
});

describe('TaxonomyProbeService.rankVocabulary', () => {
  it('returns an empty vocabulary when there are no nodes', async () => {
    const { service } = makeService();

    const vocab = await service.rankVocabulary('partition', 'sess-1', 'text');

    expect(vocab).toEqual({});
  });

  it('returns an empty vocabulary for blank text', async () => {
    const { service, taxonomy } = makeService();
    taxonomy.listNodes.mockResolvedValue([makeNode()]);

    const vocab = await service.rankVocabulary('partition', 'sess-1', '  ');

    expect(vocab).toEqual({});
  });

  it('ranks labels per tier by embedding cosine', async () => {
    const { service, taxonomy, taxonomyVectors } = makeService();
    taxonomy.listNodes.mockResolvedValue([
      makeNode({ id: 'n1', name: 'Games' }),
      makeNode({ id: 'n2', name: 'Cooking' }),
    ]);
    taxonomyVectors.searchLabels.mockImplementation(
      async ({ kind }: { kind: string }) =>
        kind === 'cluster' ? [{ id: 'n1', score: 0.9 }] : [],
    );

    const vocab = await service.rankVocabulary('partition', 'sess-1', 'games');

    expect(vocab.categories).toEqual(['Games']);
    expect(vocab.communities).toEqual([]);
  });
});

describe('TaxonomyProbeService.ensureLabelsEmbedded', () => {
  it('embeds only the labels missing vectors', async () => {
    const { service, taxonomyVectors, embeddingService } = makeService();
    taxonomyVectors.listExistingIds.mockResolvedValue(new Set(['n1']));

    await service.ensureLabelsEmbedded(
      [makeNode(), makeNode({ id: 'n2', normalizedName: 'cooking' })],
      'partition',
      'sess-1',
    );

    expect(embeddingService.embed).toHaveBeenCalledWith(
      ['cooking'],
      'document',
    );
    expect(taxonomyVectors.upsertLabelPoints).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'n2' }),
    ]);
  });

  it('skips embedding when every label already has a vector', async () => {
    const { service, taxonomyVectors, embeddingService } = makeService();
    taxonomyVectors.listExistingIds.mockResolvedValue(new Set(['n1']));

    await service.ensureLabelsEmbedded([makeNode()], 'partition', 'sess-1');

    expect(embeddingService.embed).not.toHaveBeenCalled();
  });

  it('warns and continues when the embed fails', async () => {
    const { service, taxonomyVectors, embeddingService } = makeService();
    embeddingService.embed.mockRejectedValue(new Error('down'));

    await service.ensureLabelsEmbedded([makeNode()], 'partition', 'sess-1');

    expect(taxonomyVectors.upsertLabelPoints).not.toHaveBeenCalled();
  });
});
