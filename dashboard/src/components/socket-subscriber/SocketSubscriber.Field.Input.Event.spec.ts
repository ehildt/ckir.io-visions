import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SocketSubscriberFieldInputEvent from './SocketSubscriber.Field.Input.Event.vue';

describe('SocketSubscriberFieldInputEvent', () => {
  it('renders input with placeholder', () => {
    const wrapper = mount(SocketSubscriberFieldInputEvent, {
      props: { modelValue: '', placeholder: 'Enter event' },
    });
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('placeholder')).toBe('Enter event');
  });

  it('applies blinking class', () => {
    const wrapper = mount(SocketSubscriberFieldInputEvent, {
      props: { modelValue: '', placeholder: 'Enter event', blinking: true },
    });
    expect(wrapper.find('input').classes().join(' ')).toContain(
      'animate-pulse',
    );
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SocketSubscriberFieldInputEvent, {
      props: { modelValue: '', placeholder: 'Enter event' },
    });
    const input = wrapper.find('input');
    await input.setValue('event-name');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['event-name']);
  });
});
