import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';

import { useAutoScroll } from './use-auto-scroll';

describe('useAutoScroll', () => {
  it('scrolls container to bottom when trigger fires', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollHeight', {
      value: 300,
      writable: true,
    });
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    const containerRef = ref<HTMLElement | null>(container);
    const messages = ref(0);

    useAutoScroll(containerRef, () => messages.value);

    messages.value = 1;
    await nextTick();
    await nextTick();

    expect(container.scrollTop).toBe(300);
  });

  it('does nothing when container ref is null', () => {
    const containerRef = ref<HTMLElement | null>(null);
    const messages = ref(0);

    useAutoScroll(containerRef, () => messages.value);
    messages.value = 1;
    expect(messages.value).toBe(1);
  });
});
