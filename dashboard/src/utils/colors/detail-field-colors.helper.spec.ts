import {
  getDetailFieldColors,
  getValueTypeColor,
  getValueTypeGradient,
} from './detail-field-colors.helper';

describe('getValueTypeColor', () => {
  it('detects booleans', () => {
    expect(getValueTypeColor(true)).toBe('text-harmony-1');
    expect(getValueTypeColor('true')).toBe('text-harmony-1');
  });

  it('detects numbers', () => {
    expect(getValueTypeColor(42)).toBe('text-harmony-2');
    expect(getValueTypeColor('3.14')).toBe('text-harmony-2');
  });

  it('defaults to string', () => {
    expect(getValueTypeColor('hello')).toBe('text-harmony-4');
  });
});

describe('getValueTypeGradient', () => {
  it('returns a gradient string', () => {
    expect(getValueTypeGradient(42)).toContain('from-harmony-2');
  });
});

describe('getDetailFieldColors', () => {
  it('returns colors for known fields', () => {
    expect(getDetailFieldColors('requestId').text).toBe('text-tab-rest');
    expect(getDetailFieldColors('roomId').text).toBe('text-tab-mcp');
    expect(getDetailFieldColors('event').text).toBe('text-tab-debug');
    expect(getDetailFieldColors('numCtx').text).toBe('text-tab-preprocessing');
    expect(getDetailFieldColors('endpoint').text).toBe('text-accent-primary');
  });

  it('returns muted fallback for unknown field', () => {
    const c = getDetailFieldColors('unknown');
    expect(c.text).toBe('text-fg-muted');
  });
});
