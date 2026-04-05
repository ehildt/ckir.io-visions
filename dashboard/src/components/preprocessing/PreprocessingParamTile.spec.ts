import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import PreprocessingParamTile from './PreprocessingParamTile.vue';

describe('PreprocessingParamTile', () => {
  it('renders label and description', () => {
    const wrapper = mount(PreprocessingParamTile, {
      props: { label: 'Brightness', icon: 'div' },
      slots: { default: '2.0' },
    });
    expect(wrapper.text()).toContain('Brightness');
  });

  it('shows description when provided', () => {
    const wrapper = mount(PreprocessingParamTile, {
      props: {
        label: 'Blur',
        icon: 'div',
        description: 'Gaussian blur amount',
      },
    });
    expect(wrapper.text()).toContain('Gaussian blur amount');
  });

  it('shows reset button when modified', () => {
    const wrapper = mount(PreprocessingParamTile, {
      props: { label: 'Blur', icon: 'div', modified: true },
    });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('does not show reset button when not modified', () => {
    const wrapper = mount(PreprocessingParamTile, {
      props: { label: 'Blur', icon: 'div', modified: false },
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('emits reset when reset button clicked', async () => {
    const wrapper = mount(PreprocessingParamTile, {
      props: { label: 'Blur', icon: 'div', modified: true },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('reset')).toHaveLength(1);
  });

  it('applies highlighted ring class', () => {
    const wrapper = mount(PreprocessingParamTile, {
      props: { label: 'Blur', icon: 'div', highlighted: true },
    });
    expect(wrapper.find('div').classes().join(' ')).toContain('ring-2');
  });
});
