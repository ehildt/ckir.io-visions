import { describe, expect, it } from 'vitest';

import type { ActiveTab } from '../../stores/app';
import { getTabBorderClass, getTabColorClass } from './AppHeader.helper';

describe('getTabColorClass', () => {
  it.each([
    ['rest', 'text-tab-rest'],
    ['mcp', 'text-tab-mcp'],
    ['preprocessing', 'text-tab-preprocessing'],
    ['debug', 'text-tab-debug'],
  ] as [ActiveTab, string][])('maps %s to %s', (tab, expected) => {
    expect(getTabColorClass(tab)).toBe(expected);
  });

  it('defaults to debug for unknown tab', () => {
    expect(getTabColorClass('unknown' as ActiveTab)).toBe('text-tab-debug');
  });
});

describe('getTabBorderClass', () => {
  it.each([
    ['rest', 'border-tab-rest'],
    ['mcp', 'border-tab-mcp'],
    ['preprocessing', 'border-tab-preprocessing'],
    ['debug', 'border-tab-debug'],
  ] as [ActiveTab, string][])('maps %s to %s', (tab, expected) => {
    expect(getTabBorderClass(tab)).toBe(expected);
  });

  it('defaults to debug for unknown tab', () => {
    expect(getTabBorderClass('unknown' as ActiveTab)).toBe('border-tab-debug');
  });
});
