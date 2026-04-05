import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import McpPanel from './McpPanel.vue';

vi.mock('../../composables/use-local-storage', () => ({
  useLocalStorage: () => ({
    event: { value: '' },
    roomId: { value: '' },
    method: { value: 'visions.analyze' },
    model: { value: '' },
    numCtx: { value: '16384' },
    task: { value: 'describe' },
    arguments_: { value: 'Describe this image' },
    stream: { value: true },
  }),
}));

vi.mock('../../composables/use-socket-subscription', () => ({
  useSocketSubscription: () => ({
    connectButtonBlinking: { value: false },
    eventFieldBlinking: { value: false },
    triggerEventFieldBlink: vi.fn(),
    startConnectButtonBlink: vi.fn(),
    stopConnectButtonBlink: vi.fn(),
    startEventFieldBlink: vi.fn(),
    stopEventFieldBlink: vi.fn(),
    connect: vi.fn(),
    isEventConnected: vi.fn(() => true),
    isRoomConnected: vi.fn(() => true),
  }),
}));

vi.mock('../../composables/use-toast', () => ({
  useToast: () => ({
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock('../../stores/app', () => ({
  useAppStore: () => ({
    mcpRequestId: 'mcp-id',
    refreshMcpRequestId: vi.fn(),
  }),
}));

vi.mock('./use-mcp-panel', () => ({
  useMcpPanel: () => ({
    loading: { value: false },
    isAnalyzeDisabled: { value: false },
    analyzeButtonHover: { value: false },
    fileFieldBlinking: { value: false },
    modelFieldBlinking: { value: false },
    setFiles: vi.fn(),
    setAnalyzeButtonHover: vi.fn(),
    submit: vi.fn(),
  }),
}));

vi.mock('../socket/SocketPanel.vue', () => ({
  default: { template: '<div class="socket-panel">Socket</div>' },
}));
vi.mock('./McpPanel.RequestPanel.vue', () => ({
  default: { template: '<div class="request-panel">Request</div>' },
}));

describe('McpPanel', () => {
  const socketProvider = {} as any;

  it('renders socket panel and request panel', () => {
    const wrapper = mount(McpPanel, {
      props: {
        socketProvider,
        models: ['llama'],
        modelsLoading: false,
        connectionState: 'disconnected',
      },
    });
    expect(wrapper.find('.socket-panel').exists()).toBe(true);
    expect(wrapper.find('.request-panel').exists()).toBe(true);
  });
});
