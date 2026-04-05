import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../composables/use-auto-scroll', () => ({
  useAutoScroll: vi.fn(),
}));

vi.mock('../../composables/use-event-log', () => ({
  useEventLog: vi.fn().mockReturnValue({
    copiedId: null,
    isPending: vi.fn().mockReturnValue(false),
    isAborted: vi.fn().mockReturnValue(false),
    isAborting: vi.fn().mockReturnValue(false),
    isComplete: vi.fn().mockReturnValue(true),
    isDone: vi.fn().mockReturnValue(true),
    getStatus: vi.fn().mockReturnValue('complete'),
    formatJson: vi.fn().mockReturnValue(''),
    getEvent: vi.fn(),
    getRequestId: vi.fn(),
    getTask: vi.fn(),
    getStream: vi.fn(),
    getRoom: vi.fn(),
    copyToClipboard: vi.fn(),
    getStatusColor: vi.fn().mockReturnValue(''),
    getEventColor: vi.fn().mockReturnValue(''),
    getLoadingColor: vi.fn().mockReturnValue(''),
    getLoadingSecondaryColor: vi.fn().mockReturnValue(''),
    getRoomColor: vi.fn().mockReturnValue(''),
  }),
}));

vi.mock('../../composables/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    default: vi.fn(),
  }),
}));

import EventLog from './EventLog.vue';

describe('EventLog', () => {
  it('renders empty state', () => {
    const wrapper = mount(EventLog, {
      props: { messages: [] },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.text()).toContain('waiting for events');
  });

  it('renders messages when provided', () => {
    const wrapper = mount(EventLog, {
      props: {
        messages: [{ time: '12:00', event: 'vision', data: { done: true } }],
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.text()).toContain('12:00');
    expect(wrapper.text()).toContain('vision');
  });

  it('shows count in header', () => {
    const wrapper = mount(EventLog, {
      props: {
        messages: [
          { time: '12:00', event: 'vision', data: {} },
          { time: '12:01', event: 'vision', data: {} },
        ],
      },
      global: { plugins: [createPinia()] },
    });
    expect(wrapper.text()).toContain('[2]');
  });

  it('emits clearIndex on child clear', async () => {
    const wrapper = mount(EventLog, {
      props: {
        messages: [{ time: '12:00', event: 'vision', data: { done: true } }],
      },
      global: { plugins: [createPinia()] },
    });
    await wrapper.findAll('button').at(-1)?.trigger('click');
    expect(wrapper.emitted('clearIndex')).toBeTruthy();
  });
});
