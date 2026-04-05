import { nextTick, type Ref, watch } from 'vue';

/**
 * Auto-scroll a container to bottom when a trigger value changes.
 * @param containerRef - Template ref to the scrollable container element
 * @param trigger - Reactive trigger (e.g. `() => messages.length`)
 */
export function useAutoScroll(
  containerRef: Ref<HTMLElement | null>,
  trigger: () => unknown,
) {
  watch(trigger, async () => {
    await nextTick();
    const container = containerRef.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}
