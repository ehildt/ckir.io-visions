import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import JsonField from './JsonField.vue';

describe('JsonField', () => {
  it('renders label', () => {
    const wrapper = mount(JsonField, {
      props: {
        modelValue: '',
        label: 'JSON Config',
        placeholder: 'Enter JSON',
      },
    });
    expect(wrapper.text()).toContain('JSON Config');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(JsonField, {
      props: {
        modelValue: '',
        label: 'JSON',
        placeholder: '{}',
      },
    });
    const textarea = wrapper.find('textarea');
    await textarea.setValue('{"key": "value"}');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([
      '{"key": "value"}',
    ]);
  });
});
