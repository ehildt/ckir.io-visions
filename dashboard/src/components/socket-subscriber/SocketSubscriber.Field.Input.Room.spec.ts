import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SocketSubscriberFieldInputRoom from './SocketSubscriber.Field.Input.Room.vue';

describe('SocketSubscriberFieldInputRoom', () => {
  it('renders input with placeholder', () => {
    const wrapper = mount(SocketSubscriberFieldInputRoom, {
      props: { modelValue: '', placeholder: 'room-id' },
    });
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('placeholder')).toBe('room-id');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SocketSubscriberFieldInputRoom, {
      props: { modelValue: '', placeholder: 'room-id' },
    });
    const input = wrapper.find('input');
    await input.setValue('room-123');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['room-123']);
  });
});
