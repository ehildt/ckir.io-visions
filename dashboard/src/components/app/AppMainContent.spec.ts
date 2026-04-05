import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import AppMainContent from './AppMainContent.vue';

vi.mock('../../panels/rest/RestPanel.vue', () => ({
  default: { template: '<div class="rest-panel">Rest</div>' },
}));
vi.mock('../../panels/mcp/McpPanel.vue', () => ({
  default: { template: '<div class="mcp-panel">MCP</div>' },
}));
vi.mock('../../panels/preprocessing/PreprocessingPanel.ToolsPanel.vue', () => ({
  default: { template: '<div class="preprocessing-panel">Preprocessing</div>' },
}));
vi.mock(
  '../../panels/preprocessing/PreprocessingPanel.OptionsPanel.vue',
  () => ({
    default: { template: '<div class="options-panel">Options</div>' },
  }),
);
vi.mock('../../panels/debug/DebugPanel.vue', () => ({
  default: { template: '<div class="debug-panel">Debug</div>' },
}));
vi.mock('../../panels/debug/DebugPanel.Health.vue', () => ({
  default: { template: '<div class="health">Health</div>' },
}));
vi.mock('../../panels/debug/DebugPanel.Details.vue', () => ({
  default: { template: '<div class="details">Details</div>' },
}));
vi.mock('../../components/event-log/EventLog.vue', () => ({
  default: { template: '<div class="event-log">EventLog</div>' },
}));

describe('AppMainContent', () => {
  const defaultProps = {
    activeTab: 'rest',
    restSocketProvider: {} as any,
    mcpSocketProvider: {} as any,
    models: ['llama'],
    modelsLoading: false,
    connectionState: 'disconnected' as const,
    restMessages: [],
    mcpMessages: [],
    debugResults: [],
    selectedDebugResult: null,
  };

  it('renders RestPanel when activeTab is rest', () => {
    const wrapper = mount(AppMainContent, { props: defaultProps });
    expect(wrapper.find('.rest-panel').exists()).toBe(true);
    expect(wrapper.find('.event-log').exists()).toBe(true);
  });

  it('renders McpPanel when activeTab is mcp', () => {
    const wrapper = mount(AppMainContent, {
      props: { ...defaultProps, activeTab: 'mcp' },
    });
    expect(wrapper.find('.mcp-panel').exists()).toBe(true);
    expect(wrapper.find('.event-log').exists()).toBe(true);
  });

  it('renders preprocessing panels when activeTab is preprocessing', () => {
    const wrapper = mount(AppMainContent, {
      props: { ...defaultProps, activeTab: 'preprocessing' },
    });
    expect(wrapper.find('.preprocessing-panel').exists()).toBe(true);
    expect(wrapper.find('.options-panel').exists()).toBe(true);
  });

  it('renders debug panels when activeTab is debug', () => {
    const wrapper = mount(AppMainContent, {
      props: { ...defaultProps, activeTab: 'debug' },
    });
    expect(wrapper.find('.health').exists()).toBe(true);
    expect(wrapper.find('.debug-panel').exists()).toBe(true);
    expect(wrapper.find('.details').exists()).toBe(true);
  });

  it('emits refreshModels from RestPanel', () => {
    const wrapper = mount(AppMainContent, { props: defaultProps });
    const restPanel = wrapper.findComponent('.rest-panel');
    restPanel.vm.$emit('refresh-models');
    expect(wrapper.emitted('refreshModels')).toBeTruthy();
  });

  it('emits selectDebugResult from DebugPanel', () => {
    const wrapper = mount(AppMainContent, {
      props: { ...defaultProps, activeTab: 'debug' },
    });
    const debugPanel = wrapper.findComponent('.debug-panel');
    debugPanel.vm.$emit('select', { id: '1' });
    expect(wrapper.emitted('selectDebugResult')).toBeTruthy();
  });
});
