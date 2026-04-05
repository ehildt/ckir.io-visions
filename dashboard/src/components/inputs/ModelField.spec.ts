import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ModelField from './ModelField.vue';

describe('ModelField', () => {
  it('renders Model label and refresh button', () => {
    const wrapper = mount(ModelField, {
      props: {
        modelValue: 'llama3',
        models: ['llama3', 'gpt4'],
        modelsLoading: false,
      },
    });
    expect(wrapper.text()).toContain('Model');
    // At least one button exists (ListboxButton or RefreshButton)
    expect(wrapper.findAll('button').length).toBeGreaterThan(0);
  });

  it('uses placeholder when loading', () => {
    const wrapper = mount(ModelField, {
      props: {
        modelValue: '',
        models: [],
        modelsLoading: true,
      },
    });
    expect(wrapper.text()).toContain('Loading...');
  });

  it('emits refresh-models on refresh button click', async () => {
    const wrapper = mount(ModelField, {
      props: {
        modelValue: 'llama3',
        models: ['llama3'],
        modelsLoading: false,
      },
    });
    // The refresh button is the last button inside the wrapper
    const buttons = wrapper.findAll('button');
    await buttons[buttons.length - 1].trigger('click');
    expect(wrapper.emitted('refresh-models')).toHaveLength(1);
  });

  it('emits update:modelValue on selection', async () => {
    const wrapper = mount(ModelField, {
      props: {
        modelValue: 'llama3',
        models: ['llama3', 'gpt4'],
        modelsLoading: false,
      },
    });
    // Open dropdown and click option
    const button = wrapper.findAll('button')[0];
    await button.trigger('click');
    const options = wrapper.findAll('li');
    if (options.length > 1) {
      await options[1].trigger('click');
    }
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });
});
