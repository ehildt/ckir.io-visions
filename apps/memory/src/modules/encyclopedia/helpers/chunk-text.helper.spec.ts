import { describe, expect, it } from 'vitest';

import {
  chunkTextBySections,
  chunkTextBySentences,
} from './chunk-text.helper.js';

describe('chunkTextBySentences', () => {
  it('packs sentences into chunks under the char budget', () => {
    const chunks = chunkTextBySentences('One. Two. Three. Four. Five.', 20, 0);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= 20)).toBe(true);
  });

  it('carries the last sentences of the previous chunk as overlap', () => {
    const chunks = chunkTextBySentences('One. Two. Three. Four. Five.', 20, 1);

    expect(chunks.length).toBeGreaterThan(1);
    // The second chunk starts with the last sentence of the first.
    const firstLast = chunks[0].split(' ').at(-1);
    expect(chunks[1]).toContain(firstLast!);
  });

  it('caps a single oversize sentence into its own chunk', () => {
    const chunks = chunkTextBySentences('A'.repeat(100) + '.', 20, 0);

    expect(chunks).toHaveLength(1);
    // The sentence is hard-sliced with an explicit truncation marker.
    expect(chunks[0].startsWith('A'.repeat(20))).toBe(true);
    expect(chunks[0]).toContain('TRUNCATED');
  });

  it('returns a single chunk for short content', () => {
    const chunks = chunkTextBySentences('Just one sentence.', 100, 0);

    expect(chunks).toEqual(['Just one sentence.']);
  });
});

describe('chunkTextBySections', () => {
  it('chunks each heading section independently', () => {
    const chunks = chunkTextBySections(
      '# One\nFirst sentence. Second sentence.\n## Two\nThird sentence.',
      30,
      0,
      2,
    );

    expect(chunks.length).toBeGreaterThan(1);
    // No chunk spans both sections.
    expect(
      chunks.every((c) => !(c.includes('First') && c.includes('Third'))),
    ).toBe(true);
  });

  it('degenerates to plain sentence chunking without headings', () => {
    const chunks = chunkTextBySections(
      'First sentence. Second sentence.',
      100,
      0,
      2,
    );

    expect(chunks).toEqual(['First sentence. Second sentence.']);
  });
});
