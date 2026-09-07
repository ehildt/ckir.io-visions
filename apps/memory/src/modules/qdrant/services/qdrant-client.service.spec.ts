import { describe, expect, it, vi } from 'vitest';

import type { QdrantConfig } from '../models/qdrant-config.model.js';

import { QdrantClientService } from './qdrant-client.service.js';

const config = {
  enabled: true,
  collection: 'harness_memory',
  encyclopediaCollection: 'memory_encyclopedia',
  embedModel: 'nomic-embed-text',
  vectorSize: 768,
  url: 'http://qdrant:6333',
  apiKey: undefined,
} as QdrantConfig;

function makeService() {
  const client = {
    collectionExists: vi.fn().mockResolvedValue({ exists: true }),
    createCollection: vi.fn().mockResolvedValue(undefined),
    getCollection: vi.fn().mockResolvedValue({
      config: {
        params: {
          vectors: { dense: { size: 768, distance: 'Cosine' } },
          sparse_vectors: { sparse: { modifier: 'idf' } },
        },
      },
      payload_schema: {},
    }),
    createPayloadIndex: vi.fn().mockResolvedValue(undefined),
    getCollections: vi.fn().mockResolvedValue([]),
  };
  const embeddingService = {
    embedDimension: vi.fn().mockResolvedValue(768),
  };
  const service = new QdrantClientService(
    config as never,
    embeddingService as never,
  );
  (service as any).client = client;
  return { service, client, embeddingService };
}

describe('QdrantClientService', () => {
  it('resolves model-namespaced collection names', () => {
    const { service } = makeService();

    expect(service.collection).toBe('harness_memory_nomic-embed-text');
    expect(service.encyclopediaCollection).toBe(
      'memory_encyclopedia_nomic-embed-text',
    );
    expect(service.partitionSynopsisCollection).toBe(
      'harness_memory-synopsis_nomic-embed-text',
    );
    expect(service.taxonomyCollection).toBe(
      'harness_memory-taxonomy_nomic-embed-text',
    );
  });

  it('boots the collections when enabled', async () => {
    const { service, client, embeddingService } = makeService();
    client.collectionExists.mockResolvedValue({ exists: false });

    await service.onModuleInit();

    expect(embeddingService.embedDimension).toHaveBeenCalled();
    expect(client.createCollection).toHaveBeenCalled();
    expect(client.createPayloadIndex).toHaveBeenCalled();
  });

  it('skips bootstrap when the feature is disabled', async () => {
    const { service, client, embeddingService } = makeService();
    (service as any).config = { ...config, enabled: false };

    await service.onModuleInit();

    expect(embeddingService.embedDimension).not.toHaveBeenCalled();
    expect(client.createCollection).not.toHaveBeenCalled();
  });

  it('falls back to the configured vector size when the embed probe fails', async () => {
    const { service, client, embeddingService } = makeService();
    embeddingService.embedDimension.mockRejectedValue(new Error('down'));
    client.collectionExists.mockResolvedValue({ exists: false });

    await service.onModuleInit();

    expect(client.createCollection).toHaveBeenCalledWith(
      'harness_memory_nomic-embed-text',
      expect.objectContaining({
        vectors: { dense: { size: 768, distance: 'Cosine' } },
      }),
    );
  });

  it('creates the collection only when missing', async () => {
    const { service, client } = makeService();
    client.collectionExists.mockResolvedValue({ exists: false });

    await service.ensureCollection(512);

    expect(client.createCollection).toHaveBeenCalledWith(
      'harness_memory_nomic-embed-text',
      expect.objectContaining({
        vectors: { dense: { size: 512, distance: 'Cosine' } },
      }),
    );
  });

  it('skips creating an existing collection', async () => {
    const { service, client } = makeService();

    await service.ensureCollection(512);

    expect(client.createCollection).not.toHaveBeenCalled();
  });

  it('reports the modern hybrid layout for a missing collection', async () => {
    const { service, client } = makeService();
    client.collectionExists.mockResolvedValue({ exists: false });

    const layout = await service.vectorLayout(
      'harness_memory_nomic-embed-text',
    );

    expect(layout).toEqual({ named: true, sparse: true });
  });

  it('reports the legacy layout for an unnamed-vector collection', async () => {
    const { service, client } = makeService();
    client.getCollection.mockResolvedValue({
      config: {
        params: {
          vectors: { size: 768, distance: 'Cosine' },
        },
      },
    });

    const layout = await service.vectorLayout(
      'harness_memory_nomic-embed-text',
    );

    expect(layout).toEqual({ named: false, sparse: false });
  });

  it('creates payload indexes for missing fields only', async () => {
    const { service, client } = makeService();
    client.getCollection.mockResolvedValue({
      config: {
        params: {
          vectors: { dense: { size: 768, distance: 'Cosine' } },
          sparse_vectors: { sparse: { modifier: 'idf' } },
        },
      },
      payload_schema: { memory_partition: {}, role: {} },
    });

    await service.ensurePayloadIndexes();

    const created = client.createPayloadIndex.mock.calls.map(
      (call) => call[1].field_name,
    );
    expect(created).not.toContain('memory_partition');
    expect(created).not.toContain('role');
    expect(created).toContain('session_id');
    expect(created).toContain('text');
  });

  it('pings the cluster', async () => {
    const { service, client } = makeService();

    await service.ping();

    expect(client.getCollections).toHaveBeenCalled();
  });

  it('reports whether the collection exists', async () => {
    const { service, client } = makeService();

    expect(await service.hasCollection()).toBe(true);
    expect(await service.hasEncyclopediaCollection()).toBe(true);
    expect(client.collectionExists).toHaveBeenCalled();
  });

  it('warns on a dimension mismatch', async () => {
    const { service, client } = makeService();
    client.getCollection.mockResolvedValue({
      config: {
        params: {
          vectors: { dense: { size: 384, distance: 'Cosine' } },
          sparse_vectors: { sparse: { modifier: 'idf' } },
        },
      },
    });

    await service.verifyCollectionDims(768);

    // No throw — the mismatch is a loud warning.
    expect(client.getCollection).toHaveBeenCalled();
  });
});
