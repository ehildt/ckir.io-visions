import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ClearButton from './ClearButton.vue';

describe('ClearButton', () => {
  it('renders label', () => {
    const wrapper = mount(ClearButton, {
      props: { label: 'CLEAR' },
    });
    expect(wrapper.text()).toContain('CLEAR');
  });

  it('emits click event', async () => {
    const wrapper = mount(ClearButton, {
      props: { label: 'X' },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
