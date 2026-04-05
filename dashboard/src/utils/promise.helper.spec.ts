import { describe, expect, it, vi } from 'vitest';

import { delay } from './promise.helper';

describe('delay', () => {
  it('resolves after the given milliseconds', async () => {
    vi.useFakeTimers();
    const promise = delay(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('does not resolve before the given time', async () => {
    vi.useFakeTimers();
    let resolved = false;
    delay(500).then(() => {
      resolved = true;
    });
    vi.advanceTimersByTime(499);
    expect(resolved).toBe(false);
    vi.advanceTimersByTime(1);
    await vi.waitFor(() => expect(resolved).toBe(true));
    vi.useRealTimers();
  });
});
