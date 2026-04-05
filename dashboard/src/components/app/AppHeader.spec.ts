import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AppHeader from './AppHeader.vue';

describe('AppHeader', () => {
  it('renders brand and version text', () => {
    const wrapper = mount(AppHeader, {
      props: { activeTab: 'rest', blinkLogo: false, debugCount: 0 },
    });
    expect(wrapper.text()).toContain('ckir.io');
    expect(wrapper.text()).toContain('visions');
    expect(wrapper.text()).toContain('AI Vision Testing Console');
  });

  it('renders all four tabs', () => {
    const wrapper = mount(AppHeader, {
      props: { activeTab: 'rest', blinkLogo: false, debugCount: 0 },
    });
    expect(wrapper.text()).toContain('> REST_');
    expect(wrapper.text()).toContain('> MCP_');
    expect(wrapper.text()).toContain('> PPROC_');
    expect(wrapper.text()).toContain('> DEBUG_');
  });

  it('emits tabChange when a tab is clicked', async () => {
    const wrapper = mount(AppHeader, {
      props: { activeTab: 'rest', blinkLogo: false, debugCount: 0 },
    });
    const buttons = wrapper.findAll('button');
    // Find the MCP tab button
    const mcpButton = buttons.find((b) => b.text().includes('MCP'));
    expect(mcpButton).toBeDefined();
    await mcpButton!.trigger('click');
    expect(wrapper.emitted('tabChange')).toBeTruthy();
    expect(wrapper.emitted('tabChange')![0]).toEqual(['mcp']);
  });

  it('shows counts when provided', () => {
    const wrapper = mount(AppHeader, {
      props: {
        activeTab: 'preprocessing',
        blinkLogo: false,
        debugCount: 5,
        restCount: 3,
        mcpCount: 2,
      },
    });
    expect(wrapper.text()).toContain('3');
    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('5');
  });
});
