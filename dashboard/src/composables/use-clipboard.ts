import { computed, ref } from 'vue';

export function useClipboard(timeout = 1500) {
  const copiedAt = ref<number | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      copiedAt.value = Date.now();

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copiedAt.value = null;
      }, timeout);
    } catch {
      // Silently fail if clipboard is unavailable
    }
  }

  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    copiedAt.value = null;
  }

  const isCopied = computed(() => copiedAt.value !== null);

  return {
    copiedAt,
    isCopied,
    copy,
    clear,
  };
}
