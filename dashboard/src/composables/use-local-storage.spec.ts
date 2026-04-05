import { flushPromises } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with defaults when storage is empty', () => {
    const state = useLocalStorage(
      ['a', 'b'],
      { a: 'def1', b: false },
      'my-key',
    );
    expect(state.a.value).toBe('def1');
    expect(state.b.value).toBe(false);
  });

  it('loads saved values from localStorage', () => {
    localStorage.setItem('my-key', JSON.stringify({ a: 'saved', b: true }));
    const state = useLocalStorage(
      ['a', 'b'],
      { a: 'def1', b: false },
      'my-key',
    );
    expect(state.a.value).toBe('saved');
    expect(state.b.value).toBe(true);
  });

  it('ignores extra keys in storage', () => {
    localStorage.setItem('my-key', JSON.stringify({ a: 'x', extra: 'y' }));
    const state = useLocalStorage(['a', 'b'], { a: '', b: '' }, 'my-key');
    expect(state.a.value).toBe('x');
    expect(state.b.value).toBe('');
  });

  it('persists ref changes to localStorage', async () => {
    const state = useLocalStorage(['x'], { x: 'start' }, 'persist-key');
    state.x.value = 'updated';
    await flushPromises();
    const saved = JSON.parse(localStorage.getItem('persist-key')!);
    expect(saved.x).toBe('updated');
  });
});
