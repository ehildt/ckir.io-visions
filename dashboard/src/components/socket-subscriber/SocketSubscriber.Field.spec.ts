import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SocketSubscriberField from './SocketSubscriber.Field.vue';

describe('SocketSubscriberField', () => {
  it('renders label prop', () => {
    const wrapper = mount(SocketSubscriberField, {
      props: { label: 'Event Name' },
    });
    expect(wrapper.text()).toContain('Event Name');
  });

  it('renders default slot', () => {
    const wrapper = mount(SocketSubscriberField, {
      props: { label: 'Event' },
      slots: { default: '<input data-testid="field-input" />' },
    });
    expect(wrapper.find('[data-testid="field-input"]').exists()).toBe(true);
  });
});
