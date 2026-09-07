import { describe, expect, it, vi } from 'vitest';

import { ProviderOverridesRepository } from './provider-overrides.repository.js';

function makeRepo() {
  const repo = new ProviderOverridesRepository({
    url: 'postgres://x',
  } as never);
  const prisma = {
    harnessProviderOverride: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };
  (repo as any)._prisma = prisma;
  return { repo, prisma };
}

describe('ProviderOverridesRepository', () => {
  it('finds all persisted overrides', async () => {
    const { repo, prisma } = makeRepo();
    prisma.harnessProviderOverride.findMany.mockResolvedValue([
      { provider: 'ollama', values: { host: 'x' } },
    ]);

    const rows = await repo.findAll();

    expect(rows).toHaveLength(1);
    expect(prisma.harnessProviderOverride.findMany).toHaveBeenCalled();
  });

  it('upserts a provider override', async () => {
    const { repo, prisma } = makeRepo();

    await repo.upsert('ollama', { host: 'http://ollama:11434' });

    expect(prisma.harnessProviderOverride.upsert).toHaveBeenCalledWith({
      where: { provider: 'ollama' },
      create: { provider: 'ollama', values: { host: 'http://ollama:11434' } },
      update: { values: { host: 'http://ollama:11434' } },
    });
  });

  it('deletes a provider override', async () => {
    const { repo, prisma } = makeRepo();

    await repo.deleteByProvider('ollama');

    expect(prisma.harnessProviderOverride.delete).toHaveBeenCalledWith({
      where: { provider: 'ollama' },
    });
  });

  it('tolerates a delete when nothing was persisted', async () => {
    const { repo, prisma } = makeRepo();
    prisma.harnessProviderOverride.delete.mockRejectedValue(
      new Error('not found'),
    );

    await expect(repo.deleteByProvider('ollama')).resolves.toBeNull();
  });

  it('disconnects and clears the client on destroy', async () => {
    const { repo, prisma } = makeRepo();

    await repo.onModuleDestroy();

    expect(prisma.$disconnect).toHaveBeenCalled();
    expect((repo as any)._prisma).toBeNull();
  });
});
