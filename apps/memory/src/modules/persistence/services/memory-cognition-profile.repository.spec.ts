import { describe, expect, it, vi } from 'vitest';

import { MemoryCognitionProfileRepository } from './memory-cognition-profile.repository.js';

function makeRepo() {
  const repo = new MemoryCognitionProfileRepository({
    url: 'postgres://x',
  } as never);
  const prisma = {
    memoryCognitionProfile: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };
  (repo as any)._prisma = prisma;
  return { repo, prisma };
}

describe('MemoryCognitionProfileRepository', () => {
  it('returns the stored profile for a space', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryCognitionProfile.findUnique.mockResolvedValue({
      space: 'cog-1',
      profile: { likes: ['cars'] },
      lastSessionId: 'sess-1',
      lastConversationId: null,
      lastRequestId: 'req-1',
      updatedAt: new Date('2026-01-01'),
    });

    const row = await repo.findBySpace('cog-1');

    expect(row).toEqual({
      profile: { likes: ['cars'] },
      lastSessionId: 'sess-1',
      lastConversationId: null,
      lastRequestId: 'req-1',
      updatedAt: new Date('2026-01-01'),
    });
    expect(prisma.memoryCognitionProfile.findUnique).toHaveBeenCalledWith({
      where: { space: 'cog-1' },
    });
  });

  it('returns undefined when no profile exists', async () => {
    const { repo } = makeRepo();

    const row = await repo.findBySpace('cog-1');

    expect(row).toBeUndefined();
  });

  it('upserts the merged document with provenance', async () => {
    const { repo, prisma } = makeRepo();

    await repo.upsert(
      'cog-1',
      { likes: ['cars'] },
      { sessionId: 'sess-1', requestId: 'req-1' },
    );

    expect(prisma.memoryCognitionProfile.upsert).toHaveBeenCalledWith({
      where: { space: 'cog-1' },
      create: {
        space: 'cog-1',
        profile: { likes: ['cars'] },
        lastSessionId: 'sess-1',
        lastConversationId: null,
        lastRequestId: 'req-1',
      },
      update: {
        profile: { likes: ['cars'] },
        lastSessionId: 'sess-1',
        lastConversationId: null,
        lastRequestId: 'req-1',
      },
    });
  });

  it('deletes a space document', async () => {
    const { repo, prisma } = makeRepo();

    await repo.deleteBySpace('cog-1');

    expect(prisma.memoryCognitionProfile.delete).toHaveBeenCalledWith({
      where: { space: 'cog-1' },
    });
  });

  it('tolerates a delete when nothing was persisted', async () => {
    const { repo, prisma } = makeRepo();
    prisma.memoryCognitionProfile.delete.mockRejectedValue(
      new Error('not found'),
    );

    await expect(repo.deleteBySpace('cog-1')).resolves.toBeUndefined();
  });
});
