import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';

import EventLogItem from './EventLog.Item.vue';

describe('EventLogItem', () => {
  const baseMessage = {
    time: '12:00:00',
    event: 'vision',
    data: { done: true, requestId: 'r1' },
  };

  it('renders event name and time', () => {
    const wrapper = mount(EventLogItem, {
      props: { message: baseMessage, index: 0, copiedId: null },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.text()).toContain('vision');
    expect(wrapper.text()).toContain('12:00:00');
  });

  it('shows status indicator when pending', () => {
    const wrapper = mount(EventLogItem, {
      props: {
        message: {
          time: '12:00',
          event: 'e',
          data: { pending: true, requestId: 'r2' },
        },
        index: 0,
        copiedId: null,
      },
      global: { plugins: [createPinia()] },
    });
    // The header will show a pending indicator
    expect(wrapper.find('.animate-battery-slide').exists()).toBe(true);
  });

  it('shows no status when done', () => {
    const wrapper = mount(EventLogItem, {
      props: { message: baseMessage, index: 0, copiedId: null },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.find('.animate-battery-slide').exists()).toBe(false);
  });
});
