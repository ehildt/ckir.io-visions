import { type Ref, watch } from 'vue';

/**
 * Bidirectional localStorage sync for a reactive object.
 *
 * @param storageKey — key in localStorage
 * @param state — reactive ref to watch & persist
 * @param options.load — custom loader (defaults to JSON.parse)
 * @param options.save — custom serializer (defaults to JSON.stringify)
 * @param options.immediate — call load() immediately and merge into state
 */
export function useLocalStorageSync<T extends object>(
  storageKey: string,
  state: Ref<T>,
  options?: {
    load?: (raw: string) => Partial<T>;
    save?: (value: T) => string;
    immediate?: boolean;
  },
) {
  const loadFn = options?.load ?? (JSON.parse as (raw: string) => Partial<T>);
  const saveFn = options?.save ?? JSON.stringify;

  /** Read partial state from localStorage (undefined if missing or corrupt). */
  function load(): Partial<T> | undefined {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return loadFn(raw);
    } catch {
      /* ignore read errors */
    }
    return undefined;
  }

  /** Persist current state to localStorage. */
  function save() {
    try {
      localStorage.setItem(storageKey, saveFn(state.value));
    } catch {
      /* ignore storage errors */
    }
  }

  /** Watcher — auto-saves on every deep mutation. */
  const stop = watch(state, save, { deep: true });

  if (options?.immediate !== false) {
    const saved = load();
    if (saved) {
      state.value = { ...state.value, ...saved } as T;
    }
  }

  return { load, save, stop };
}
