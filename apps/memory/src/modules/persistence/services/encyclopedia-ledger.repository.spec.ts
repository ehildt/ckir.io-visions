import { describe, expect, it, vi } from 'vitest';

import { EncyclopediaLedgerRepository } from './encyclopedia-ledger.repository.js';

function makeRepo() {
  const repo = new EncyclopediaLedgerRepository({
    url: 'postgres://x',
  } as never);
  const prisma = {
    memoryEncyclopediaInsertLedger: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(0),
    },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };
  (repo as any)._prisma = prisma;
  return { repo, prisma };
}

const row = {
  id: 'r1',
  url: 'https://example.com/a',
  contentHash: 'h1',
  chunkCount: 2,
  partitionScope: 'global',
  title: 'A',
  requestId: 'req-1',
  createdAt: new Date('2026-01-01'),
  sweptAt: null,
  classifiedAt: null,
};

describe('EncyclopediaLedgerRepository', () => {
  it('inserts rows in a batch', async () => {
    const { repo, prisma } = makeRepo();
    const rows = [
      {
        url: 'https://example.com/a',
        contentHash: 'h1',
        chunkCount: 2,
        partitionScope: 'global',
      },
    ];

    await repo.insertMany(rows);

    expect(
      prisma.memoryEncyclopediaInsertLedger.createMany,
    ).toHaveBeenCalledWith({
      data: rows,
    });
  });

  it('skips an empty batch', async () => {
    const { repo, prisma } = makeRepo();

    await repo.insertMany([]);

    expect(
      prisma.memoryEncyclopediaInsertLedger.createMany,
    ).not.toHaveBeenCalled();
  });

  it('lists pending rows oldest-first', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryEncyclopediaInsertLedger.findMany.mockResolvedValue([row]);

    const rows = await repo.listPending(10);

    expect(rows).toHaveLength(1);
    expect(prisma.memoryEncyclopediaInsertLedger.findMany).toHaveBeenCalledWith(
      {
        where: { sweptAt: null },
        orderBy: { createdAt: 'asc' },
        take: 10,
      },
    );
  });

  it('marks rows swept', async () => {
    const { repo, prisma } = makeRepo();

    await repo.markSwept(['r1']);

    expect(
      prisma.memoryEncyclopediaInsertLedger.updateMany,
    ).toHaveBeenCalledWith({
      where: { id: { in: ['r1'] } },
      data: { sweptAt: expect.any(Date) },
    });
  });

  it('counts pending rows', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryEncyclopediaInsertLedger.count.mockResolvedValue(7);

    const count = await repo.countPending();

    expect(count).toBe(7);
  });

  it('lists rows pending classification', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryEncyclopediaInsertLedger.findMany.mockResolvedValue([row]);

    const rows = await repo.listPendingClassification(5);

    expect(rows).toHaveLength(1);
    expect(prisma.memoryEncyclopediaInsertLedger.findMany).toHaveBeenCalledWith(
      {
        where: { classifiedAt: null },
        orderBy: { createdAt: 'asc' },
        take: 5,
      },
    );
  });

  it('marks rows classified', async () => {
    const { repo, prisma } = makeRepo();

    await repo.markClassified(['r1']);

    expect(
      prisma.memoryEncyclopediaInsertLedger.updateMany,
    ).toHaveBeenCalledWith({
      where: { id: { in: ['r1'] } },
      data: { classifiedAt: expect.any(Date) },
    });
  });

  it('counts rows pending classification', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryEncyclopediaInsertLedger.count.mockResolvedValue(3);

    const count = await repo.countPendingClassification();

    expect(count).toBe(3);
  });
});
