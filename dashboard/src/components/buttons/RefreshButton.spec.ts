import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import RefreshButton from './RefreshButton.vue';

describe('RefreshButton', () => {
  it('renders refresh icon', () => {
    const wrapper = mount(RefreshButton);
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('emits click event', async () => {
    const wrapper = mount(RefreshButton);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('applies disabled styling', () => {
    const wrapper = mount(RefreshButton, { props: { disabled: true } });
    expect(wrapper.find('button').classes().join(' ')).toContain(
      'disabled:opacity-50',
    );
  });
});
