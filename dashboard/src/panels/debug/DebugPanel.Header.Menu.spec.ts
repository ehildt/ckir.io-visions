import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DebugPanelHeaderMenu from './DebugPanel.Header.Menu.vue';

describe('DebugPanelHeaderMenu', () => {
  it('renders filter buttons and counts', () => {
    const wrapper = mount(DebugPanelHeaderMenu, {
      props: { filter: 'all', allCount: 10, httpCount: 7, socketCount: 3 },
    });
    expect(wrapper.text()).toContain('ALL');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('HTTP');
    expect(wrapper.text()).toContain('7');
    expect(wrapper.text()).toContain('SOCKET');
    expect(wrapper.text()).toContain('3');
    expect(wrapper.text()).toContain('CLR');
  });

  it('emits update:filter when a filter button is clicked', async () => {
    const wrapper = mount(DebugPanelHeaderMenu, {
      props: { filter: 'all', allCount: 0, httpCount: 0, socketCount: 0 },
    });
    const httpButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('HTTP'));
    expect(httpButton).toBeDefined();
    await httpButton!.trigger('click');
    expect(wrapper.emitted('update:filter')).toBeTruthy();
    expect(wrapper.emitted('update:filter')![0]).toEqual(['http']);
  });

  it('emits clear on CLR click', async () => {
    const wrapper = mount(DebugPanelHeaderMenu, {
      props: { filter: 'all', allCount: 0, httpCount: 0, socketCount: 0 },
    });
    const clearButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('CLR'));
    expect(clearButton).toBeDefined();
    await clearButton!.trigger('click');
    expect(wrapper.emitted('clear')).toBeTruthy();
  });
});
