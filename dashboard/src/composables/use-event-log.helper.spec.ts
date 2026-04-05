import { describe, expect, it } from 'vitest';

import {
  getEventColor,
  getLoadingColor,
  getLoadingSecondaryColor,
  getRoomColor,
  getStatusColor,
} from './use-event-log.helper';

describe('getEventColor', () => {
  it.each([
    ['error', 'text-event'],
    ['Error', 'text-event'],
    ['connect', 'text-event'],
    ['abort', 'text-loading-secondary'],
    ['normal', 'text-event'],
  ])('maps %s to %s', (event, expected) => {
    expect(getEventColor(event)).toBe(expected);
  });
});

describe('getRoomColor', () => {
  it('returns text-room', () => {
    expect(getRoomColor()).toBe('text-room');
  });
});

describe('getLoadingColor', () => {
  it('returns text-loading', () => {
    expect(getLoadingColor()).toBe('text-loading');
  });
});

describe('getLoadingSecondaryColor', () => {
  it('returns text-loading-secondary', () => {
    expect(getLoadingSecondaryColor()).toBe('text-loading-secondary');
  });
});

describe('getStatusColor', () => {
  it.each([
    ['pending', 'border-accent-primary text-accent-primary'],
    ['aborting', 'border-error text-error'],
    ['aborted', 'text-error'],
    ['other', ''],
  ])('maps %s to "%s"', (status, expected) => {
    expect(getStatusColor(status)).toBe(expected);
  });
});
