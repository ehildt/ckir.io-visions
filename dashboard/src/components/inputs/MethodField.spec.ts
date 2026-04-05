import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import MethodField from './MethodField.vue';

describe('MethodField', () => {
  it('renders Method label', () => {
    const wrapper = mount(MethodField, {
      props: { modelValue: 'initialize' },
    });
    expect(wrapper.text()).toContain('Method');
  });

  it('uses default options when none provided', () => {
    const wrapper = mount(MethodField, {
      props: { modelValue: 'initialize' },
    });
    // Default options are available in the Listbox options; button shows selected
    expect(wrapper.text()).toContain('initialize');
  });

  it('emits update:modelValue on selection change', async () => {
    const wrapper = mount(MethodField, {
      props: { modelValue: 'initialize' },
    });
    // Open the Listbox and click an option
    const button = wrapper.find('button');
    await button.trigger('click');
    const options = wrapper.findAll('li');
    if (options.length > 1) {
      await options[1].trigger('click');
    }
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
