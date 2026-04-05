import { onUnmounted, ref, watch } from 'vue';

/**
 * Debounced loading indicator – delays showing loading state to avoid flicker.
 * @param loadingGetter - Reactive getter returning loading boolean
 * @param delay - Milliseconds to wait before showing loading (default 500)
 */
export function useDebouncedLoading(loadingGetter: () => boolean, delay = 500) {
  const showLoading = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const stop = watch(loadingGetter, (isLoading) => {
    if (isLoading) {
      timer = setTimeout(() => {
        showLoading.value = true;
      }, delay);
    } else {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      showLoading.value = false;
    }
  });

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
    stop();
  });

  return { showLoading };
}
