import { describe, expect, it } from 'vitest';

import { isFoldedMainDot } from './is-folded-main-dot.helper';

describe('isFoldedMainDot', () => {
  it('is true only for a main dot whose blob is collapsed', () => {
    const dot = { isTopic: true, topicKey: 'work' };

    expect(isFoldedMainDot(dot, new Set(['work']))).toBe(true);
    expect(isFoldedMainDot(dot, new Set())).toBe(false);
  });

  it('is false for leaf dots regardless of collapsed keys', () => {
    const leaf = { isTopic: undefined, topicKey: 'work' };

    expect(isFoldedMainDot(leaf, new Set(['work']))).toBe(false);
  });
});
