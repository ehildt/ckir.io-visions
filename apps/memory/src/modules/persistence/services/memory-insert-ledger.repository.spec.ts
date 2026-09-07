import { describe, expect, it, vi } from 'vitest';

import { MemoryInsertLedgerRepository } from './memory-insert-ledger.repository.js';

function makeRepo() {
  const repo = new MemoryInsertLedgerRepository({
    url: 'postgres://x',
  } as never);
  const prisma = {
    memoryInsertLedger: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(0),
    },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };
  (repo as any)._prisma = prisma;
  return { repo, prisma };
}

describe('MemoryInsertLedgerRepository', () => {
  it('inserts rows in a batch', async () => {
    const { repo, prisma } = makeRepo();
    const rows = [
      {
        memoryPartition: 'sess-1',
        pointId: 'p1',
        role: 'user' as const,
        text: 'x',
      },
    ];

    await repo.insertMany(rows);

    expect(prisma.memoryInsertLedger.createMany).toHaveBeenCalledWith({
      data: rows,
    });
  });

  it('skips an empty batch', async () => {
    const { repo, prisma } = makeRepo();

    await repo.insertMany([]);

    expect(prisma.memoryInsertLedger.createMany).not.toHaveBeenCalled();
  });

  it('lists pending rows oldest-first', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryInsertLedger.findMany.mockResolvedValue([
      {
        id: 'r1',
        memoryPartition: 'sess-1',
        pointId: 'p1',
        role: 'user',
        text: 'x',
        requestId: 'req-1',
        createdAt: new Date('2026-01-01'),
        sweptAt: null,
      },
    ]);

    const rows = await repo.listPending('sess-1', 10);

    expect(rows).toEqual([
      {
        id: 'r1',
        memoryPartition: 'sess-1',
        pointId: 'p1',
        role: 'user',
        text: 'x',
        requestId: 'req-1',
        createdAt: new Date('2026-01-01'),
      },
    ]);
    expect(prisma.memoryInsertLedger.findMany).toHaveBeenCalledWith({
      where: { memoryPartition: 'sess-1', sweptAt: null },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
  });

  it('lists distinct pending partitions with counts', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryInsertLedger.groupBy.mockResolvedValue([
      { memoryPartition: 'sess-1', _count: { _all: 3 } },
    ]);

    const partitions = await repo.listPendingPartitions();

    expect(partitions).toEqual([{ memoryPartition: 'sess-1', pending: 3 }]);
  });

  it('marks rows swept', async () => {
    const { repo, prisma } = makeRepo();

    await repo.markSwept(['r1', 'r2']);

    expect(prisma.memoryInsertLedger.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['r1', 'r2'] } },
      data: { sweptAt: expect.any(Date) },
    });
  });

  it('skips marking an empty id list', async () => {
    const { repo, prisma } = makeRepo();

    await repo.markSwept([]);

    expect(prisma.memoryInsertLedger.updateMany).not.toHaveBeenCalled();
  });

  it('counts pending rows of a partition', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryInsertLedger.count.mockResolvedValue(5);

    const count = await repo.countPending('sess-1');

    expect(count).toBe(5);
    expect(prisma.memoryInsertLedger.count).toHaveBeenCalledWith({
      where: { memoryPartition: 'sess-1', sweptAt: null },
    });
  });
});
