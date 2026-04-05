import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import RequestIdField from './RequestIdField.vue';

describe('RequestIdField', () => {
  it('renders Request ID label', () => {
    const wrapper = mount(RequestIdField, {
      props: { modelValue: 'req-123' },
    });
    expect(wrapper.text()).toContain('Request ID');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RequestIdField, {
      props: { modelValue: '' },
    });
    const input = wrapper.find('input');
    await input.setValue('req-456');
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['req-456']);
  });

  it('emits refresh on button click', async () => {
    const wrapper = mount(RequestIdField, {
      props: { modelValue: 'req-123' },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('refresh')).toHaveLength(1);
  });
});
