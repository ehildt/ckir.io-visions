import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SocketSubscriberFieldLabel from './SocketSubscriber.Field.Label.vue';

describe('SocketSubscriberFieldLabel', () => {
  it('renders text prop inside FormLabel', () => {
    const wrapper = mount(SocketSubscriberFieldLabel, {
      props: { text: 'Room ID' },
    });
    expect(wrapper.text()).toContain('Room ID');
    expect(wrapper.find('label').exists()).toBe(true);
  });
});
