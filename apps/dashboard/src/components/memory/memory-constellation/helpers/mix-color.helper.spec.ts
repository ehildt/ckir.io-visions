import { describe, expect, it } from 'vitest';

import { mixColor } from './mix-color.helper';

describe('mixColor', () => {
  it('returns the base color at ratio 0', () => {
    expect(mixColor('#8b5cf6', '#f0643c', 0)).toBe('#8b5cf6');
  });

  it('returns the target color at ratio 1', () => {
    expect(mixColor('#8b5cf6', '#f0643c', 1)).toBe('#f0643c');
  });

  it('lerps channels at an intermediate ratio', () => {
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('clamps the ratio into 0..1', () => {
    expect(mixColor('#000000', '#ffffff', 2)).toBe('#ffffff');
    expect(mixColor('#000000', '#ffffff', -1)).toBe('#000000');
  });

  it('returns the input unchanged for a non-hex base color', () => {
    expect(mixColor('not-a-color', '#ffffff', 0.5)).toBe('not-a-color');
  });

  it('returns the input unchanged for a non-hex target color', () => {
    expect(mixColor('#8b5cf6', 'not-a-color', 0.5)).toBe('#8b5cf6');
  });
});
