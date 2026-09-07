import { describe, expect, it } from 'vitest';

import { buildSparseVector } from './build-sparse-vector.helper.js';

describe('buildSparseVector', () => {
  it('builds parallel index/value arrays for a text', () => {
    const vector = buildSparseVector('hello world hello');

    expect(vector.indices).toHaveLength(2);
    expect(vector.values).toHaveLength(2);
    expect(vector.indices.every((i) => Number.isInteger(i) && i >= 0)).toBe(
      true,
    );
    // 'hello' appears twice, 'world' once.
    expect(vector.values).toEqual(expect.arrayContaining([2, 1]));
  });

  it('is deterministic for the same text', () => {
    const a = buildSparseVector('the quick brown fox');
    const b = buildSparseVector('the quick brown fox');

    expect(a).toEqual(b);
  });

  it('is case-insensitive', () => {
    const a = buildSparseVector('Hello World');
    const b = buildSparseVector('hello world');

    expect(a).toEqual(b);
  });

  it('sorts indices ascending', () => {
    const vector = buildSparseVector('zebra apple mango');

    const sorted = [...vector.indices].sort((x, y) => x - y);
    expect(vector.indices).toEqual(sorted);
  });

  it('handles empty text', () => {
    expect(buildSparseVector('')).toEqual({ indices: [], values: [] });
  });

  it('handles CJK text by hashing character tokens', () => {
    const vector = buildSparseVector('你好世界');

    expect(vector.indices.length).toBeGreaterThan(0);
    expect(vector.values.length).toBe(vector.indices.length);
  });
});
