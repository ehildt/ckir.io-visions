import { describe, expect, it, vi } from 'vitest';

import { TaxonomyVectorRepository } from './taxonomy-vector.repository.js';

function makeRepo() {
  const client = {
    collectionExists: vi.fn().mockResolvedValue({ exists: true }),
    retrieve: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ points: [] }),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const clientService = {
    taxonomyCollection: 'taxonomy_nomic',
    getClient: vi.fn().mockReturnValue(client),
  };
  const repo = new TaxonomyVectorRepository(clientService as never);
  return { repo, client, clientService };
}

const point = {
  id: 'n1',
  vector: [0.1, 0.2],
  lane: 'partition' as const,
  scopeKey: 'sess-1',
  kind: 'cluster' as const,
  parentId: 'root',
  normalizedName: 'games',
};

describe('TaxonomyVectorRepository', () => {
  it('lists existing ids from the collection', async () => {
    const { repo, client } = makeRepo();
    client.retrieve.mockResolvedValue([{ id: 'n1' }, { id: 'n2' }]);

    const ids = await repo.listExistingIds(['n1', 'n2']);

    expect(ids).toEqual(new Set(['n1', 'n2']));
    expect(client.retrieve).toHaveBeenCalledWith('taxonomy_nomic', {
      ids: ['n1', 'n2'],
      with_payload: false,
      with_vector: false,
    });
  });

  it('returns an empty set when the collection is missing', async () => {
    const { repo, client } = makeRepo();
    client.collectionExists.mockResolvedValue({ exists: false });

    const ids = await repo.listExistingIds(['n1']);

    expect(ids).toEqual(new Set());
    expect(client.retrieve).not.toHaveBeenCalled();
  });

  it('returns an empty set for no ids', async () => {
    const { repo, client } = makeRepo();

    const ids = await repo.listExistingIds([]);

    expect(ids).toEqual(new Set());
    expect(client.retrieve).not.toHaveBeenCalled();
  });

  it('upserts label points with the payload shape', async () => {
    const { repo, client } = makeRepo();

    await repo.upsertLabelPoints([point]);

    expect(client.upsert).toHaveBeenCalledWith('taxonomy_nomic', {
      wait: true,
      points: [
        {
          id: 'n1',
          vector: [0.1, 0.2],
          payload: {
            lane: 'partition',
            scope_key: 'sess-1',
            kind: 'cluster',
            parent_id: 'root',
            normalized_name: 'games',
          },
        },
      ],
    });
  });

  it('skips upserting when the collection is missing', async () => {
    const { repo, client } = makeRepo();
    client.collectionExists.mockResolvedValue({ exists: false });

    await repo.upsertLabelPoints([point]);

    expect(client.upsert).not.toHaveBeenCalled();
  });

  it('searches labels with the kind/scope filter', async () => {
    const { repo, client } = makeRepo();
    client.query.mockResolvedValue({
      points: [{ id: 'n1', score: 0.9, payload: { normalized_name: 'games' } }],
    });

    const hits = await repo.searchLabels({
      lane: 'partition',
      scopeKey: 'sess-1',
      kind: 'cluster',
      vector: [0.1, 0.2],
      limit: 5,
    });

    expect(hits).toEqual([{ id: 'n1', score: 0.9, normalizedName: 'games' }]);
    expect(client.query).toHaveBeenCalledWith(
      'taxonomy_nomic',
      expect.objectContaining({
        filter: {
          must: [
            { key: 'lane', match: { value: 'partition' } },
            { key: 'scope_key', match: { value: 'sess-1' } },
            { key: 'kind', match: { value: 'cluster' } },
          ],
        },
        limit: 5,
      }),
    );
  });

  it('adds the parent filter when a parent is given', async () => {
    const { repo, client } = makeRepo();

    await repo.searchLabels({
      lane: 'partition',
      scopeKey: 'sess-1',
      kind: 'community',
      parentId: 'n1',
      vector: [0.1],
      limit: 3,
    });

    const filter = client.query.mock.calls[0][1].filter;
    expect(filter.must).toContainEqual({
      key: 'parent_id',
      match: { value: 'n1' },
    });
  });

  it('returns no hits when the collection is missing', async () => {
    const { repo, client } = makeRepo();
    client.collectionExists.mockResolvedValue({ exists: false });

    const hits = await repo.searchLabels({
      lane: 'partition',
      scopeKey: 'sess-1',
      kind: 'cluster',
      vector: [0.1],
      limit: 5,
    });

    expect(hits).toEqual([]);
    expect(client.query).not.toHaveBeenCalled();
  });

  it('lists label vectors for the given ids', async () => {
    const { repo, client } = makeRepo();
    client.retrieve.mockResolvedValue([
      { id: 'n1', vector: [0.1, 0.2] },
      { id: 'n2', vector: [0.3, 0.4] },
    ]);

    const vectors = await repo.listLabelVectors(['n1', 'n2']);

    expect(vectors.get('n1')).toEqual([0.1, 0.2]);
    expect(vectors.get('n2')).toEqual([0.3, 0.4]);
  });

  it('deletes label points', async () => {
    const { repo, client } = makeRepo();

    await repo.deleteLabelPoints(['n1']);

    expect(client.delete).toHaveBeenCalledWith('taxonomy_nomic', {
      points: ['n1'],
      wait: true,
    });
  });

  it('skips deleting when the collection is missing', async () => {
    const { repo, client } = makeRepo();
    client.collectionExists.mockResolvedValue({ exists: false });

    await repo.deleteLabelPoints(['n1']);

    expect(client.delete).not.toHaveBeenCalled();
  });
});
