import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StreamField from './StreamField.vue';

describe('StreamField', () => {
  it('renders Stream label', () => {
    const wrapper = mount(StreamField, {
      props: { modelValue: false },
    });
    expect(wrapper.text()).toContain('Stream');
  });

  it('converts string "true" to boolean true', async () => {
    const wrapper = mount(StreamField, {
      props: { modelValue: false },
    });
    const button = wrapper.find('button');
    await button.trigger('click');
    const options = wrapper.findAll('li');
    const trueOption = options.find((o) => o.text().includes('true'));
    if (trueOption) await trueOption.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([true]);
  });

  it('converts string "false" to boolean false', async () => {
    const wrapper = mount(StreamField, {
      props: { modelValue: true },
    });
    const button = wrapper.find('button');
    await button.trigger('click');
    const options = wrapper.findAll('li');
    const falseOption = options.find((o) => o.text().includes('false'));
    if (falseOption) await falseOption.trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([false]);
  });
});
