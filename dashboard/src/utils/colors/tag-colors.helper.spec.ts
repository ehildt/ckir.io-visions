import {
  getDirectionColors,
  getTagColorClasses,
  getTypeColors,
} from './tag-colors.helper';

describe('getTypeColors', () => {
  it('returns socket colors', () => {
    const c = getTypeColors('socket');
    expect(c.text).toBe('text-warning');
    expect(c.bg).toBe('bg-warning/10');
  });

  it('returns default colors for non-socket', () => {
    const c = getTypeColors('http');
    expect(c.text).toBe('text-accent-primary');
  });
});

describe('getDirectionColors', () => {
  it('returns response colors', () => {
    const c = getDirectionColors('response');
    expect(c.text).toBe('text-tab-rest');
  });

  it('returns request colors', () => {
    const c = getDirectionColors('request');
    expect(c.text).toBe('text-tab-mcp');
  });
});

describe('getTagColorClasses', () => {
  it('handles type variant', () => {
    expect(getTagColorClasses('type', 'socket').text).toBe('text-tab-rest');
    expect(getTagColorClasses('type', 'http').text).toBe('text-tab-mcp');
  });

  it('handles direction variant', () => {
    expect(getTagColorClasses('direction', 'response').text).toBe(
      'text-tab-rest',
    );
    expect(getTagColorClasses('direction', 'request').text).toBe(
      'text-tab-mcp',
    );
  });

  it('handles status variant', () => {
    expect(getTagColorClasses('status', 'success').text).toBe('text-tab-rest');
    expect(getTagColorClasses('status', 'error').text).toBe('text-tab-debug');
  });

  it('falls back to debug for unknown variant', () => {
    const c = getTagColorClasses('unknown' as any, 'x');
    expect(c.text).toBe('text-tab-debug');
  });
});
