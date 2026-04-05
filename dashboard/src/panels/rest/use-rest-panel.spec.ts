import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

vi.mock('../../composables/use-response-handler', () => ({
  handleResponse: vi.fn(),
}));

vi.mock('../../composables/use-toast', () => ({
  useToast: vi.fn(() => ({
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  })),
}));

vi.mock('../../composables/use-validation', () => ({
  requireModel: vi.fn(() => true),
  validateConnection: vi.fn(() => true),
}));

vi.mock('../../utils/http.helper', () => ({
  buildFormData: vi.fn(() => new FormData()),
  buildHeaders: vi.fn(() => ({})),
  buildQueryParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('@/api/api-url', () => ({
  getApiUrl: (path: string) => `http://localhost${path}`,
}));

vi.mock('@/stores/preprocessing', () => ({
  usePreprocessingStore: () => ({
    buildQueryParams: () => ({}),
  }),
}));

const mockBlink = {
  start: vi.fn(),
  stop: vi.fn(),
  blink: vi.fn(),
  isBlinking: { value: false },
};

vi.mock('../../composables/use-blink', () => ({
  useBlink: () => mockBlink,
}));

import { useRestPanel } from './use-rest-panel';

describe('useRestPanel', () => {
  const createOptions = () => ({
    socketProvider: {
      getSocket: vi.fn(() => ({ connected: true })),
      addPendingMessage: vi.fn(),
      trackRequest: vi.fn(),
    } as any,
    model: ref('llama'),
    task: ref('describe'),
    prompt: ref('test'),
    stream: ref(true),
    roomId: ref('room-1'),
    numCtx: ref('16384'),
    event: ref('vision'),
    requestId: ref('req-id'),
    isEventConnected: vi.fn(() => true),
    isRoomConnected: vi.fn(() => true),
    startConnectButtonBlink: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct defaults', () => {
    const result = useRestPanel(createOptions());
    expect(result.loading.value).toBe(false);
    expect(result.isAnalyzeDisabled.value).toBe(true);
    expect(result.fileFieldBlinking.value).toBe(false);
    expect(result.modelFieldBlinking.value).toBe(false);
  });

  it('sets files and enables analyze', () => {
    const result = useRestPanel(createOptions());
    const file = new File([''], 'test.png');
    result.setFiles([file]);
    expect(result.files.value.length).toBe(1);
    expect(result.isAnalyzeDisabled.value).toBe(false);
  });

  it('triggers file field blink when no files', () => {
    const result = useRestPanel(createOptions());
    mockBlink.blink.mockClear();
    result.setAnalyzeButtonHover(true);
    expect(mockBlink.start).toHaveBeenCalled();
  });

  it('stops file field blink on hover when files present', () => {
    const result = useRestPanel(createOptions());
    result.setFiles([new File([''], 'test.png')]);
    result.setAnalyzeButtonHover(true);
    expect(mockBlink.stop).toHaveBeenCalled();
  });

  it('triggers file field blink', () => {
    const result = useRestPanel(createOptions());
    result.triggerFileFieldBlink();
    expect(mockBlink.blink).toHaveBeenCalledWith(1000);
  });

  it('does not trigger file field blink when files exist', () => {
    const result = useRestPanel(createOptions());
    result.setFiles([new File([''], 'test.png')]);
    mockBlink.blink.mockClear();
    result.triggerFileFieldBlink();
    expect(mockBlink.blink).not.toHaveBeenCalled();
  });

  it('submit succeeds with mocked fetch', async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const options = createOptions();
    const result = useRestPanel(options);
    result.setFiles([new File([''], 'test.png')]);

    await result.submit();

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(options.socketProvider.trackRequest).toHaveBeenCalled();
    expect(result.loading.value).toBe(false);
  });

  it('submit handles fetch error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network'));

    const { useToast } = await import('../../composables/use-toast.js');
    const options = createOptions();
    const result = useRestPanel(options);
    result.setFiles([new File([''], 'test.png')]);

    await result.submit();

    const toast = vi.mocked(useToast).mock.results[0]?.value ?? useToast();
    expect(toast.error).toHaveBeenCalledWith('network');
    expect(result.loading.value).toBe(false);
  });

  it('submit returns early when model missing', async () => {
    const { requireModel } =
      await import('../../composables/use-validation.js');
    vi.mocked(requireModel).mockReturnValueOnce(false);

    const options = createOptions();
    options.model.value = '';
    const result = useRestPanel(options);
    result.setFiles([new File([''], 'test.png')]);
    globalThis.fetch = vi.fn();

    await result.submit();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(result.loading.value).toBe(false);
  });

  it('submit returns early when connection invalid', async () => {
    const { validateConnection } =
      await import('../../composables/use-validation.js');
    vi.mocked(validateConnection).mockReturnValueOnce(false);

    const options = createOptions();
    const result = useRestPanel(options);
    result.setFiles([new File([''], 'test.png')]);
    globalThis.fetch = vi.fn();

    await result.submit();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(result.loading.value).toBe(false);
  });
});
