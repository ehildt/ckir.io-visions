import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import NumCtxField from './NumCtxField.vue';

describe('NumCtxField', () => {
  it('renders NumCtx label', () => {
    const wrapper = mount(NumCtxField, {
      props: { modelValue: '16384' },
    });
    expect(wrapper.text()).toContain('NumCtx');
  });

  it('uses 16384 as default when empty', () => {
    const wrapper = mount(NumCtxField, {
      props: { modelValue: '' },
    });
    expect(wrapper.text()).toContain('16384');
  });

  it('emits update:modelValue on selection', async () => {
    const wrapper = mount(NumCtxField, {
      props: { modelValue: '16384' },
    });
    const button = wrapper.find('button');
    await button.trigger('click');
    const options = wrapper.findAll('li');
    if (options.length > 1) {
      await options[1].trigger('click');
    }
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
