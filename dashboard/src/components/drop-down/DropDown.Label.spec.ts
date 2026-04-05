import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DropDownLabel from './DropDown.Label.vue';

describe('DropDownLabel', () => {
  it('renders text prop inside label', () => {
    const wrapper = mount(DropDownLabel, {
      props: { text: 'Method' },
    });
    expect(wrapper.text()).toContain('Method');
    expect(wrapper.find('label').exists()).toBe(true);
  });
});
