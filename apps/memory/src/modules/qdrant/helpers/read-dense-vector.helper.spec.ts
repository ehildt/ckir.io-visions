import { describe, expect, it } from 'vitest';

import { readDenseVector } from './read-dense-vector.helper.js';

describe('readDenseVector', () => {
  it('returns a flat array as-is', () => {
    expect(readDenseVector([0.1, 0.2])).toEqual([0.1, 0.2]);
  });

  it('reads the dense vector from a named-vector object', () => {
    expect(
      readDenseVector({
        dense: [0.3, 0.4],
        sparse: { indices: [], values: [] },
      }),
    ).toEqual([0.3, 0.4]);
  });

  it('returns an empty array for a missing dense vector', () => {
    expect(readDenseVector({ sparse: { indices: [], values: [] } })).toEqual(
      [],
    );
  });

  it('returns an empty array for a corrupt dense vector', () => {
    expect(readDenseVector({ dense: 'not-an-array' })).toEqual([]);
  });

  it('returns an empty array for null or undefined', () => {
    expect(readDenseVector(null)).toEqual([]);
    expect(readDenseVector(undefined)).toEqual([]);
  });

  it('returns an empty array for primitives', () => {
    expect(readDenseVector(42)).toEqual([]);
    expect(readDenseVector('vector')).toEqual([]);
  });
});
