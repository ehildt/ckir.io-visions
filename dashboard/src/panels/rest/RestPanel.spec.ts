import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import RestPanel from './RestPanel.vue';

vi.mock('../../composables/use-local-storage', () => ({
  useLocalStorage: () => ({
    event: { value: '' },
    roomId: { value: '' },
    task: { value: 'describe' },
    model: { value: '' },
    numCtx: { value: '16384' },
    prompt: { value: 'Describe this image' },
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
    restRequestId: 'req-id',
    refreshRestRequestId: vi.fn(),
  }),
}));

vi.mock('./use-rest-panel', () => ({
  useRestPanel: () => ({
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
vi.mock('./RestPanel.RequestPanel.vue', () => ({
  default: { template: '<div class="request-panel">Request</div>' },
}));

describe('RestPanel', () => {
  const socketProvider = {} as any;

  it('renders socket panel and request panel', () => {
    const wrapper = mount(RestPanel, {
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
