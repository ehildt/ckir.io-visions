import { describe, expect, it, vi } from 'vitest';

import { useClipboard } from './use-clipboard';

describe('useClipboard', () => {
  it('copies text and sets copiedAt', async () => {
    const { copy, copiedAt, isCopied } = useClipboard(500);
    await copy('hello');
    expect(copiedAt.value).not.toBeNull();
    expect(isCopied.value).toBe(true);
  });

  it('clears after timeout', async () => {
    vi.useFakeTimers();
    const { copy, isCopied } = useClipboard(500);
    await copy('hello');
    expect(isCopied.value).toBe(true);
    vi.advanceTimersByTime(500);
    expect(isCopied.value).toBe(false);
    vi.useRealTimers();
  });

  it('clear resets state immediately', async () => {
    const { copy, clear, isCopied } = useClipboard(1000);
    await copy('hello');
    expect(isCopied.value).toBe(true);
    clear();
    expect(isCopied.value).toBe(false);
  });

  it('silently fails when clipboard is unavailable', async () => {
    vi.useFakeTimers();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(new Error('fail'));
    const { copy, isCopied } = useClipboard(500);
    await copy('hello');
    expect(isCopied.value).toBe(false);
    writeText.mockRestore();
    vi.useRealTimers();
  });
});
