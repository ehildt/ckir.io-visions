import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SocketSubscriberSubscribeButton from './SocketSubscriber.SubscribeButton.vue';

describe('SocketSubscriberSubscribeButton', () => {
  it('renders Subscribe text', () => {
    const wrapper = mount(SocketSubscriberSubscribeButton, {
      props: { disabled: false },
    });
    expect(wrapper.text()).toContain('Subscribe');
  });

  it('emits click on button click', async () => {
    const wrapper = mount(SocketSubscriberSubscribeButton, {
      props: { disabled: false },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('emits mouseenter on hover', async () => {
    const wrapper = mount(SocketSubscriberSubscribeButton, {
      props: { disabled: false },
    });
    await wrapper.find('button').trigger('mouseenter');
    expect(wrapper.emitted('mouseenter')).toHaveLength(1);
  });

  it('emits mouseleave on mouse leave', async () => {
    const wrapper = mount(SocketSubscriberSubscribeButton, {
      props: { disabled: false },
    });
    await wrapper.find('button').trigger('mouseleave');
    expect(wrapper.emitted('mouseleave')).toHaveLength(1);
  });

  it('applies blinking animation class', () => {
    const wrapper = mount(SocketSubscriberSubscribeButton, {
      props: { disabled: false, blinking: true },
    });
    expect(wrapper.find('button').classes().join(' ')).toContain(
      'animate-pulse',
    );
  });

  it('applies disabled styling', () => {
    const wrapper = mount(SocketSubscriberSubscribeButton, {
      props: { disabled: true },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });
});
