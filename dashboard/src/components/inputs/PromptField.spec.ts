import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import PromptField from './PromptField.vue';

vi.mock('../ui', () => ({
  FormLabel: { template: '<label><slot /></label>' },
  InputTextArea: {
    props: ['modelValue', 'placeholder', 'rows'],
    template:
      '<textarea :placeholder="placeholder" :rows="rows" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
  },
}));

describe('PromptField', () => {
  it('renders label and textarea', () => {
    const wrapper = mount(PromptField, {
      props: { modelValue: 'hello', label: 'Prompt' },
    });
    expect(wrapper.text()).toContain('Prompt');
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('textarea').element.value).toBe('hello');
  });

  it('emits update on input', async () => {
    const wrapper = mount(PromptField, {
      props: { modelValue: 'hello', label: 'Prompt' },
    });
    await wrapper.find('textarea').setValue('world');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['world']);
  });
});
