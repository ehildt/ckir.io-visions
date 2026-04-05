import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';

import App from './App.vue';

vi.mock('./stores/app', () => ({
  useAppStore: () => ({
    activeTab: 'rest',
    blinkLogo: false,
    restRequestId: 'req-id',
    mcpRequestId: 'mcp-id',
    refreshRestRequestId: vi.fn(),
    refreshMcpRequestId: vi.fn(),
    abortJob: vi.fn(),
    handleCopyToClipboard: vi.fn(),
    handleModelSelected: vi.fn(),
  }),
}));

vi.mock('./stores/debug', () => ({
  useDebugStore: () => ({
    debugLogCount: 0,
    debugResults: [],
    selectedDebugResult: null,
    addSocketDebugEntry: vi.fn(),
    clearDebugResults: vi.fn(),
  }),
}));

vi.mock('./stores/messages', () => ({
  useRestMessagesStore: () => ({
    completedCount: 0,
    messages: [],
    addMessage: vi.fn(),
    clearMessages: vi.fn(),
  }),
  useMcpMessagesStore: () => ({
    completedCount: 0,
    messages: [],
    addMessage: vi.fn(),
    clearMessages: vi.fn(),
  }),
}));

vi.mock('./stores/models', () => ({
  useModelsStore: () => ({
    models: ['llama'],
    modelsLoading: false,
    fetchModels: vi.fn(),
  }),
}));

vi.mock('./stores/socket', () => ({
  useSocketStore: () => ({
    connectionState: 'disconnected',
    socketId: '',
    setCallbacks: vi.fn(),
    getSocket: vi.fn(() => ({ connected: false })),
    trackRequest: vi.fn(),
    addPendingMessage: vi.fn(),
    closeEvent: vi.fn(),
    closeRoom: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToEvent: vi.fn(),
  }),
}));

vi.mock('./stores/socket.helper', () => ({
  createSocketProvider: () => ({
    getSocket: vi.fn(() => ({ connected: false })),
    trackRequest: vi.fn(),
    addPendingMessage: vi.fn(),
    closeEvent: vi.fn(),
    closeRoom: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    subscribeToEvent: vi.fn(),
  }),
}));

vi.mock('./stores/theme', () => ({
  useThemeStore: () => ({
    currentTheme: 'souls',
    themeColors: {
      souls: { name: 'Dark Souls', primary: '#cd853f' },
      diablo: { name: 'Diablo', primary: '#c0392b' },
    },
    darkThemes: ['souls', 'diablo'],
    darkThemes2: [],
    initTheme: vi.fn(),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    setActivePinia(createPinia());
    const wrapper = mount(App);
    expect(wrapper.find('header').exists()).toBe(true);
    expect(wrapper.find('main').exists()).toBe(true);
  });
});
