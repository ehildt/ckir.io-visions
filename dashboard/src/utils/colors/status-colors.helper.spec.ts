import {
  getConnectionStateColors,
  getStatusCodeColor,
  getStatusCodeTabColor,
  getStatusColors,
} from './status-colors.helper';

describe('getStatusCodeColor', () => {
  it('returns success for 200-299', () => {
    expect(getStatusCodeColor(200)).toBe('text-status-code-success');
    expect(getStatusCodeColor(299)).toBe('text-status-code-success');
  });

  it('returns error for 400+', () => {
    expect(getStatusCodeColor(400)).toBe('text-status-code-error');
    expect(getStatusCodeColor(500)).toBe('text-status-code-error');
  });

  it('returns default otherwise', () => {
    expect(getStatusCodeColor(100)).toBe('text-status-code-default');
    expect(getStatusCodeColor(304)).toBe('text-status-code-default');
  });
});

describe('getStatusCodeTabColor', () => {
  it('returns muted for undefined code', () => {
    expect(getStatusCodeTabColor()).toBe('text-fg-muted');
  });

  it('maps success to rest tab', () => {
    expect(getStatusCodeTabColor(200)).toBe('text-tab-rest');
  });

  it('maps client errors to mcp tab', () => {
    expect(getStatusCodeTabColor(404)).toBe('text-tab-mcp');
  });

  it('maps server errors to debug tab', () => {
    expect(getStatusCodeTabColor(500)).toBe('text-tab-debug');
  });
});

describe('getStatusColors', () => {
  it('returns success colors', () => {
    const c = getStatusColors('success');
    expect(c.bg).toContain('bg-status-success');
    expect(c.text).toContain('text-status-success');
    expect(c.border).toContain('border-status-success');
  });

  it('returns error colors', () => {
    const c = getStatusColors('error');
    expect(c.bg).toContain('bg-status-error');
    expect(c.text).toContain('text-status-error');
    expect(c.border).toContain('border-status-error');
  });
});

describe('getConnectionStateColors', () => {
  it('maps states to text classes', () => {
    expect(getConnectionStateColors('connected').text).toBe(
      'text-connection-connected',
    );
    expect(getConnectionStateColors('disconnected').text).toBe(
      'text-connection-disconnected',
    );
    expect(getConnectionStateColors('error').text).toBe(
      'text-connection-error',
    );
  });

  it('returns default for unknown state', () => {
    expect(getConnectionStateColors('unknown' as any).text).toBe(
      'text-connection-default',
    );
  });
});
