import { type Ref, ref, watch } from 'vue';

export interface FieldDefinition {
  key: string;
  defaultValue: string | boolean;
}

export function useLocalStorage(
  keys: string[],
  defaults: Record<string, string | boolean>,
  storageKey: string,
): Record<string, Ref<string | boolean>> {
  const saved = localStorage.getItem(storageKey);
  const parsed = saved ? JSON.parse(saved) : {};

  const state: Record<string, Ref<string | boolean>> = {};

  for (const key of keys) {
    const initialValue = parsed[key] ?? defaults[key];
    state[key] = ref(initialValue);
  }

  function save() {
    const data: Record<string, string | boolean> = {};
    for (const key of keys) {
      data[key] = state[key].value as string | boolean;
    }
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  watch(
    () => {
      const values: Record<string, string | boolean> = {};
      for (const key of keys) {
        values[key] = state[key].value as string | boolean;
      }
      return values;
    },
    () => {
      save();
    },
    { deep: true },
  );

  return { ...state } as unknown as Record<string, Ref<string | boolean>>;
}
