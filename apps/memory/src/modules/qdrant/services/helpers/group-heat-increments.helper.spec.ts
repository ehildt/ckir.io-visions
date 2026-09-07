import { describe, expect, it } from 'vitest';

import { groupHeatIncrements } from './group-heat-increments.helper.js';

describe('groupHeatIncrements', () => {
  it('groups hits by their current heat count', () => {
    const groups = groupHeatIncrements([
      { id: 'a', heatAmount: 2 },
      { id: 'b', heatAmount: 2 },
      { id: 'c', heatAmount: 5 },
    ]);

    expect(groups).toEqual([
      { nextAmount: 3, ids: ['a', 'b'] },
      { nextAmount: 6, ids: ['c'] },
    ]);
  });

  it('treats hits without a heat amount as cold (0 → 1)', () => {
    const groups = groupHeatIncrements([{ id: 'a' }, { id: 'b' }]);

    expect(groups).toEqual([{ nextAmount: 1, ids: ['a', 'b'] }]);
  });

  it('returns an empty array for no hits', () => {
    expect(groupHeatIncrements([])).toEqual([]);
  });
});
