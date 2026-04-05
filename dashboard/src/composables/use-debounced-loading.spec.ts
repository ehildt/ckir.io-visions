import { flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useDebouncedLoading } from './use-debounced-loading';

describe('useDebouncedLoading', () => {
  it('delays showing loading state', async () => {
    vi.useFakeTimers();
    const loading = ref(false);
    const { showLoading } = useDebouncedLoading(() => loading.value, 500);

    expect(showLoading.value).toBe(false);
    loading.value = true;
    await flushPromises();
    expect(showLoading.value).toBe(false);
    vi.advanceTimersByTime(499);
    expect(showLoading.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(showLoading.value).toBe(true);
    vi.useRealTimers();
  });

  it('hides loading immediately when loading becomes false', async () => {
    vi.useFakeTimers();
    const loading = ref(false);
    const { showLoading } = useDebouncedLoading(() => loading.value, 100);
    loading.value = true;
    await flushPromises();
    vi.advanceTimersByTime(100);
    expect(showLoading.value).toBe(true);
    loading.value = false;
    await flushPromises();
    expect(showLoading.value).toBe(false);
    vi.useRealTimers();
  });

  it('does not show loading if reset before delay', async () => {
    vi.useFakeTimers();
    const loading = ref(false);
    const { showLoading } = useDebouncedLoading(() => loading.value, 1000);
    loading.value = true;
    await flushPromises();
    vi.advanceTimersByTime(500);
    loading.value = false;
    await flushPromises();
    vi.advanceTimersByTime(500);
    expect(showLoading.value).toBe(false);
    vi.useRealTimers();
  });
});
