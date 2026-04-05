import { computed, ref } from 'vue';

export function useBlink(defaultDuration = 1000) {
  const isBlinking = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function blink(duration = defaultDuration) {
    start();
    timer = setTimeout(() => {
      stop();
    }, duration);
  }

  function start() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    isBlinking.value = true;
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    isBlinking.value = false;
  }

  const isActive = computed(() => isBlinking.value);

  return {
    isBlinking: isActive,
    blink,
    start,
    stop,
  };
}
