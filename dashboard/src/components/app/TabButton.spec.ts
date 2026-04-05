import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TabButton from './TabButton.vue';

describe('TabButton', () => {
  it('renders label', () => {
    const wrapper = mount(TabButton, {
      props: {
        label: 'REST',
        tab: 'rest',
        activeTab: 'mcp',
        activeClasses: 'bg-tab-rest',
        hoverClasses: '',
      },
    });
    expect(wrapper.text()).toContain('REST');
  });

  it('emits click event', async () => {
    const wrapper = mount(TabButton, {
      props: {
        label: 'REST',
        tab: 'rest',
        activeTab: 'mcp',
        activeClasses: '',
        hoverClasses: '',
      },
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('shows active styling when active', () => {
    const wrapper = mount(TabButton, {
      props: {
        label: 'REST',
        tab: 'rest',
        activeTab: 'rest',
        activeClasses: 'bg-tab-rest',
        hoverClasses: '',
      },
    });
    expect(wrapper.find('button').classes().join(' ')).toContain('bg-tab-rest');
  });

  it('shows count badge when not active and count > 0', () => {
    const wrapper = mount(TabButton, {
      props: {
        label: 'Debug',
        tab: 'debug',
        activeTab: 'rest',
        activeClasses: '',
        hoverClasses: '',
        count: 5,
      },
    });
    expect(wrapper.find('span.absolute').exists()).toBe(true);
    expect(wrapper.text()).toContain('5');
  });

  it('does not show count badge when active', () => {
    const wrapper = mount(TabButton, {
      props: {
        label: 'Debug',
        tab: 'debug',
        activeTab: 'debug',
        activeClasses: '',
        hoverClasses: '',
        count: 5,
      },
    });
    expect(wrapper.find('span.absolute').exists()).toBe(false);
  });

  it('caps count at 99+', () => {
    const wrapper = mount(TabButton, {
      props: {
        label: 'Debug',
        tab: 'debug',
        activeTab: 'rest',
        activeClasses: '',
        hoverClasses: '',
        count: 150,
      },
    });
    expect(wrapper.text()).toContain('99+');
  });
});
