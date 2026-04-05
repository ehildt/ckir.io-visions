import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import SocketSubscriber from './SocketSubscriber.vue';

vi.mock('../../composables/use-socket-subscription', () => ({
  useSocketSubscription: () => ({
    isSubscribeDisabled: false,
    buttonBlinking: false,
  }),
}));

vi.mock('./SocketSubscriber.Field.vue', () => ({
  default: { template: '<div class="field"><slot /></div>' },
}));
vi.mock('./SocketSubscriber.Field.Input.Event.vue', () => ({
  default: {
    props: ['modelValue', 'placeholder', 'blinking'],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}));
vi.mock('./SocketSubscriber.Field.Input.Room.vue', () => ({
  default: {
    props: ['modelValue', 'placeholder'],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}));
vi.mock('./SocketSubscriber.SubscribeButton.vue', () => ({
  default: {
    props: ['disabled', 'blinking'],
    template:
      '<button @click="$emit(\'click\')" @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')">Subscribe</button>',
  },
}));

describe('SocketSubscriber', () => {
  const socketProvider = {} as any;

  it('renders event and room inputs and subscribe button', () => {
    const wrapper = mount(SocketSubscriber, {
      props: {
        connectionState: 'disconnected',
        socketProvider,
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    expect(wrapper.findAll('input').length).toBe(2);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('emits connect with event and room on button click', async () => {
    const wrapper = mount(SocketSubscriber, {
      props: {
        connectionState: 'disconnected',
        socketProvider,
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('connect')).toBeTruthy();
    expect(wrapper.emitted('connect')![0]).toEqual([
      { event: 'vision', room: 'room-1' },
    ]);
  });

  it('emits connect without room when room is empty', async () => {
    const wrapper = mount(SocketSubscriber, {
      props: {
        connectionState: 'disconnected',
        socketProvider,
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: '',
      },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('connect')).toBeTruthy();
    expect(wrapper.emitted('connect')![0]).toEqual([
      { event: 'vision', room: undefined },
    ]);
  });

  it('emits eventFieldBlink and subscribeError when event is empty', async () => {
    const wrapper = mount(SocketSubscriber, {
      props: {
        connectionState: 'disconnected',
        socketProvider,
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: '',
        roomId: '',
      },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('eventFieldBlink')).toBeTruthy();
    expect(wrapper.emitted('subscribeError')).toBeTruthy();
  });

  it('emits update:event on input change', async () => {
    const wrapper = mount(SocketSubscriber, {
      props: {
        connectionState: 'disconnected',
        socketProvider,
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: '',
      },
    });
    const eventInput = wrapper.findAll('input')[0];
    await eventInput.setValue('new-event');
    expect(wrapper.emitted('update:event')).toBeTruthy();
    expect(wrapper.emitted('update:event')![0]).toEqual(['new-event']);
  });

  it('emits update:roomId on input change', async () => {
    const wrapper = mount(SocketSubscriber, {
      props: {
        connectionState: 'disconnected',
        socketProvider,
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    const roomInput = wrapper.findAll('input')[1];
    await roomInput.setValue('new-room');
    expect(wrapper.emitted('update:roomId')).toBeTruthy();
    expect(wrapper.emitted('update:roomId')![0]).toEqual(['new-room']);
  });
});
