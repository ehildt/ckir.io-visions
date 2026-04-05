import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useAppStore } from './app';

vi.mock('../composables/use-clipboard', () => ({
  useClipboard: vi.fn().mockReturnValue({
    copy: vi.fn().mockResolvedValue(undefined),
    isCopied: ref(false),
    clear: vi.fn(),
  }),
}));

let delayResolve: (() => void) | null = null;

vi.mock('../utils/promise.helper', () => ({
  delay: vi.fn().mockImplementation(() => {
    return new Promise<void>((resolve) => {
      delayResolve = resolve;
    });
  }),
}));

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    delayResolve = null;
  });

  it('initializes with correct defaults', () => {
    const store = useAppStore();
    expect(store.activeTab).toBe('rest');
    expect(store.blinkLogo).toBe(true);
    expect(store.copiedIndex).toBeNull();
    expect(store.abortingId).toBeNull();
  });

  it('handleCopyToClipboard sets copiedIndex and resets after delay resolves', async () => {
    const store = useAppStore();
    const promise = store.handleCopyToClipboard('hello', 3);
    await Promise.resolve(); // flush up to first await
    expect(store.copiedIndex).toBe(3);

    delayResolve!();
    await promise;
    expect(store.copiedIndex).toBeNull();
  });

  it('refreshRestRequestId generates new id', () => {
    const store = useAppStore();
    const prev = store.restRequestId;
    store.refreshRestRequestId();
    expect(store.restRequestId).not.toBe(prev);
  });

  it('refreshMcpRequestId generates new id', () => {
    const store = useAppStore();
    const prev = store.mcpRequestId;
    store.refreshMcpRequestId();
    expect(store.mcpRequestId).not.toBe(prev);
  });

  it('handleModelSelected triggers blinkLogo', () => {
    vi.useFakeTimers();
    const store = useAppStore();
    store.blinkLogo = false;
    store.handleModelSelected();
    expect(store.blinkLogo).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(store.blinkLogo).toBe(false);
    vi.useRealTimers();
  });

  it('abortJob returns true on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    );
    const store = useAppStore();
    const result = await store.abortJob('req-1');
    expect(result).toBe(true);
    expect(store.abortingId).toBeNull();
  });

  it('abortJob returns false on non-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, text: () => Promise.resolve('err') }),
    );
    const store = useAppStore();
    const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await store.abortJob('req-2');
    expect(result).toBe(false);
    spyWarn.mockRestore();
  });

  it('abortJob returns false on exception', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    const store = useAppStore();
    const spyErr = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await store.abortJob('req-3');
    expect(result).toBe(false);
    spyErr.mockRestore();
  });
});
