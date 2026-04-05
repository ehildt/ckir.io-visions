import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useLocalStorageSync } from './use-local-storage-sync';

describe('useLocalStorageSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads saved state and merges with default', () => {
    localStorage.setItem('key1', JSON.stringify({ a: 2, b: 'loaded' }));
    const state = ref<{ a: number; b: string }>({ a: 1, b: 'default' });
    useLocalStorageSync('key1', state);
    expect(state.value).toEqual({ a: 2, b: 'loaded' });
  });

  it('persists changes to localStorage', async () => {
    const state = ref<{ x: number }>({ x: 0 });
    useLocalStorageSync('key2', state);
    state.value.x = 5;
    await flushPromises();
    const saved = JSON.parse(localStorage.getItem('key2')!);
    expect(saved).toEqual({ x: 5 });
  });

  it('save returns void', () => {
    const state = ref<{ y: string }>({ y: 'a' });
    const { save } = useLocalStorageSync('key3', state);
    expect(() => save()).not.toThrow();
    expect(JSON.parse(localStorage.getItem('key3')!)).toEqual({ y: 'a' });
  });

  it('load returns undefined when key missing', () => {
    const state = ref<{ z: boolean }>({ z: true });
    const { load } = useLocalStorageSync('missing', state);
    expect(load()).toBeUndefined();
  });

  it('load handles corrupted json gracefully', () => {
    localStorage.setItem('bad', 'not json');
    const state = ref<{ a: number }>({ a: 1 });
    const { load } = useLocalStorageSync('bad', state);
    expect(load()).toBeUndefined();
  });

  it('custom save and load functions are used', () => {
    localStorage.setItem('custom', 'raw-data');
    const state = ref<{ val: string }>({ val: 'hello' });
    const saveFn = vi.fn((v) => JSON.stringify(v));
    const loadFn = vi.fn().mockReturnValue({ val: 'world' });
    useLocalStorageSync('custom', state, { save: saveFn, load: loadFn });
    expect(loadFn).toHaveBeenCalledWith('raw-data');
    expect(state.value.val).toBe('world');
  });

  it('immediate: false skips load on init', () => {
    localStorage.setItem('no-load', JSON.stringify({ a: 99 }));
    const state = ref<{ a: number }>({ a: 1 });
    useLocalStorageSync('no-load', state, { immediate: false });
    expect(state.value.a).toBe(1);
  });

  it('stop unregisters the watcher', () => {
    const state = ref<{ n: number }>({ n: 0 });
    const { stop } = useLocalStorageSync('stop-key', state);
    stop();
    state.value.n = 10;
    // should not update localStorage after stop
    expect(localStorage.getItem('stop-key')).toBeNull();
  });
});
