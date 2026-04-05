import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TaskField from './TaskField.vue';

describe('TaskField', () => {
  it('renders Task label', () => {
    const wrapper = mount(TaskField, {
      props: { modelValue: 'describe' },
    });
    expect(wrapper.text()).toContain('Task');
  });

  it('uses default options when none provided', () => {
    const wrapper = mount(TaskField, {
      props: { modelValue: 'describe' },
    });
    expect(wrapper.text()).toContain('describe');
  });

  it('emits update:modelValue on selection', async () => {
    const wrapper = mount(TaskField, {
      props: { modelValue: 'describe' },
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
