import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import SocketPanel from './SocketPanel.vue';

vi.mock('../../components/socket-subscriber/SocketSubscriber.vue', () => ({
  default: {
    props: [
      'connectionState',
      'socketProvider',
      'connectButtonBlinking',
      'eventFieldBlinking',
      'event',
      'roomId',
    ],
    template: '<div class="subscriber">Subscriber</div>',
  },
}));

describe('SocketPanel', () => {
  const socketProvider = {} as any;

  it('renders socket panel header and subscriber', () => {
    const wrapper = mount(SocketPanel, {
      props: {
        socketProvider,
        connectionState: 'connected',
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    expect(wrapper.text()).toContain('Socket.io');
    expect(wrapper.text()).toContain('/socket.io');
    expect(wrapper.find('.subscriber').exists()).toBe(true);
  });

  it('emits connect on handleConnect', () => {
    const wrapper = mount(SocketPanel, {
      props: {
        socketProvider,
        connectionState: 'connected',
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    const vm = wrapper.vm as any;
    vm.handleConnect({ event: 'vision', room: 'room-1' });
    expect(wrapper.emitted('connect')).toBeTruthy();
    expect(wrapper.emitted('connect')![0]).toEqual([
      { event: 'vision', room: 'room-1' },
    ]);
  });

  it('emits update:event', () => {
    const wrapper = mount(SocketPanel, {
      props: {
        socketProvider,
        connectionState: 'connected',
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    const vm = wrapper.vm as any;
    vm.handleUpdateEvent('test');
    expect(wrapper.emitted('update:event')).toBeTruthy();
    expect(wrapper.emitted('update:event')![0]).toEqual(['test']);
  });

  it('emits update:roomId', () => {
    const wrapper = mount(SocketPanel, {
      props: {
        socketProvider,
        connectionState: 'connected',
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    const vm = wrapper.vm as any;
    vm.handleUpdateRoomId('new-room');
    expect(wrapper.emitted('update:roomId')).toBeTruthy();
    expect(wrapper.emitted('update:roomId')![0]).toEqual(['new-room']);
  });

  it('emits closeEvent', () => {
    const wrapper = mount(SocketPanel, {
      props: {
        socketProvider,
        connectionState: 'connected',
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    const vm = wrapper.vm as any;
    vm.handleCloseEvent('vision');
    expect(wrapper.emitted('closeEvent')).toBeTruthy();
    expect(wrapper.emitted('closeEvent')![0]).toEqual(['vision']);
  });

  it('emits closeRoom', () => {
    const wrapper = mount(SocketPanel, {
      props: {
        socketProvider,
        connectionState: 'connected',
        connectButtonBlinking: false,
        eventFieldBlinking: false,
        event: 'vision',
        roomId: 'room-1',
      },
    });
    const vm = wrapper.vm as any;
    vm.handleCloseRoom('vision', 'room-1');
    expect(wrapper.emitted('closeRoom')).toBeTruthy();
    expect(wrapper.emitted('closeRoom')![0]).toEqual(['vision', 'room-1']);
  });
});
