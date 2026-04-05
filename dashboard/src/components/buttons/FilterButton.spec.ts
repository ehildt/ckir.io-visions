import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import FilterButton from './FilterButton.vue';

describe('FilterButton', () => {
  it('renders label', () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'ALL', color: 'accent-primary' },
    });
    expect(wrapper.text()).toContain('ALL');
  });

  it('emits click', async () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'X', color: 'info' },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('shows active styling when active', () => {
    const wrapper = mount(FilterButton, {
      props: { label: 'ALL', color: 'accent-primary', active: true },
    });
    expect(wrapper.find('button').classes().join(' ')).toContain(
      'shadow-[0_0_6px',
    );
  });
});
