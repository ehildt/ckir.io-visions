import { describe, expect, it } from 'vitest';

import {
  sharesTokenOverlap,
  trigramSimilarity,
} from './trigram-similarity.helper.js';

describe('trigramSimilarity', () => {
  it('returns 1 for identical labels', () => {
    expect(trigramSimilarity('games', 'games')).toBe(1);
  });

  it('returns 1 for identical labels with different case', () => {
    expect(trigramSimilarity('Games', 'games')).toBe(1);
  });

  it('returns 0 for short labels that differ', () => {
    expect(trigramSimilarity('ab', 'cd')).toBe(0);
  });

  it('returns 1 for identical short labels', () => {
    expect(trigramSimilarity('ab', 'ab')).toBe(1);
  });

  it('scores similar labels highly', () => {
    expect(trigramSimilarity('games', 'gaming')).toBeGreaterThan(0.3);
  });

  it('scores near-identical labels very highly', () => {
    expect(trigramSimilarity('auth-service', 'auth-services')).toBeGreaterThan(
      0.8,
    );
  });

  it('scores unrelated labels low', () => {
    expect(trigramSimilarity('games', 'cooking')).toBeLessThan(0.3);
  });

  it('is symmetric', () => {
    expect(trigramSimilarity('games', 'gaming')).toBe(
      trigramSimilarity('gaming', 'games'),
    );
  });
});

describe('sharesTokenOverlap', () => {
  it('returns true when labels share an alphanumeric token', () => {
    expect(sharesTokenOverlap('machine learning', 'learning curve')).toBe(true);
  });

  it('returns false when labels share no token', () => {
    expect(sharesTokenOverlap('machine learning', 'cooking recipes')).toBe(
      false,
    );
  });

  it('is case-insensitive', () => {
    expect(sharesTokenOverlap('Cars', 'cars racing')).toBe(true);
  });

  it('handles empty labels', () => {
    expect(sharesTokenOverlap('', 'cars')).toBe(false);
    expect(sharesTokenOverlap('', '')).toBe(false);
  });
});
