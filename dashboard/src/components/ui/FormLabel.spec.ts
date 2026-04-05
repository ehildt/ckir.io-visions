import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FormLabel from './FormLabel.vue';

describe('FormLabel', () => {
  it('renders text prop', () => {
    const wrapper = mount(FormLabel, {
      props: { text: 'Email' },
    });
    expect(wrapper.text()).toBe('Email');
  });

  it('renders slot content over text prop', () => {
    const wrapper = mount(FormLabel, {
      props: { text: 'Prop' },
      slots: { default: 'Slot Content' },
    });
    expect(wrapper.text()).toBe('Slot Content');
  });

  it('has label element with expected classes', () => {
    const wrapper = mount(FormLabel, {
      props: { text: 'A' },
    });
    expect(wrapper.find('label').exists()).toBe(true);
    expect(wrapper.find('label').classes().join(' ')).toContain('font-mono');
  });
});
