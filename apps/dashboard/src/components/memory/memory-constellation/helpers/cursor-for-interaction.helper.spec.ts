import { describe, expect, it } from 'vitest';

import { cursorForInteraction } from './cursor-for-interaction.helper';

describe('cursorForInteraction', () => {
  it('grabs the camera while a drag/pan interaction is active', () => {
    expect(cursorForInteraction(true, true)).toBe('grabbing');
    expect(cursorForInteraction(true, false)).toBe('grabbing');
  });

  it('points at a selectable dot when idle', () => {
    expect(cursorForInteraction(false, true)).toBe('pointer');
  });

  it('grabs when idle with nothing hovered', () => {
    expect(cursorForInteraction(false, false)).toBe('grab');
  });
});
