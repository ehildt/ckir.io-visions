import { describe, expect, it, vi } from 'vitest';

import { MemoryClusterRepository } from './memory-cluster.repository.js';

function makeRepo() {
  const repo = new MemoryClusterRepository({ url: 'postgres://x' } as never);
  const prisma = {
    memoryCluster: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: vi.fn().mockImplementation(async (ops: unknown[]) => {
      for (const op of ops) await op;
    }),
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };
  (repo as any)._prisma = prisma;
  return { repo, prisma };
}

const row = {
  id: 'cl-1',
  lane: 'partition',
  collection: 'harness_memory_nomic',
  scopeKey: 'sess-1',
  fingerprint: 'fp',
  title: 'Cars',
  summary: 'All about cars',
  memberCount: 3,
  memberIds: ['p1', 'p2', 'p3'],
  level: 0,
  parentId: null,
};

describe('MemoryClusterRepository', () => {
  it('lists clusters of a scope, largest first', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryCluster.findMany.mockResolvedValue([row]);

    const clusters = await repo.listByScope(
      'partition',
      'harness_memory_nomic',
      'sess-1',
    );

    expect(clusters).toEqual([
      {
        id: 'cl-1',
        lane: 'partition',
        collection: 'harness_memory_nomic',
        scopeKey: 'sess-1',
        fingerprint: 'fp',
        title: 'Cars',
        summary: 'All about cars',
        memberCount: 3,
        memberIds: ['p1', 'p2', 'p3'],
        level: 0,
        parentId: undefined,
      },
    ]);
    expect(prisma.memoryCluster.findMany).toHaveBeenCalledWith({
      where: {
        lane: 'partition',
        collection: 'harness_memory_nomic',
        scopeKey: 'sess-1',
      },
      orderBy: { memberCount: 'desc' },
    });
  });

  it('finds clusters by id', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryCluster.findMany.mockResolvedValue([row]);

    const clusters = await repo.findByIds(['cl-1']);

    expect(clusters).toHaveLength(1);
    expect(prisma.memoryCluster.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['cl-1'] } },
    });
  });

  it('returns an empty list for no ids', async () => {
    const { repo, prisma } = makeRepo();

    const clusters = await repo.findByIds([]);

    expect(clusters).toEqual([]);
    expect(prisma.memoryCluster.findMany).not.toHaveBeenCalled();
  });

  it('replaces a scope atomically', async () => {
    const { repo, prisma } = makeRepo();

    await repo.replaceScope('partition', 'harness_memory_nomic', 'sess-1', [
      row as never,
    ]);

    expect(prisma.$transaction).toHaveBeenCalledWith([
      expect.objectContaining({}),
      expect.objectContaining({}),
    ]);
    expect(prisma.memoryCluster.deleteMany).toHaveBeenCalledWith({
      where: {
        lane: 'partition',
        collection: 'harness_memory_nomic',
        scopeKey: 'sess-1',
      },
    });
    expect(prisma.memoryCluster.createMany).toHaveBeenCalledWith({
      data: [row],
      skipDuplicates: true,
    });
  });

  it('deletes a scope', async () => {
    const { repo, prisma } = makeRepo();

    await repo.deleteByScope('partition', 'harness_memory_nomic', 'sess-1');

    expect(prisma.memoryCluster.deleteMany).toHaveBeenCalledWith({
      where: {
        lane: 'partition',
        collection: 'harness_memory_nomic',
        scopeKey: 'sess-1',
      },
    });
  });
});
