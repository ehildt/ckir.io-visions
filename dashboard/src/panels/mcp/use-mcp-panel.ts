import { computed, type Ref, ref } from 'vue';

import { getApiUrl } from '@/api/api-url';
import { usePreprocessingStore } from '@/stores/preprocessing';

import { useBlink } from '../../composables/use-blink';
import { handleResponse } from '../../composables/use-response-handler';
import { useToast } from '../../composables/use-toast';
import {
  requireFiles,
  requireModel,
  validateConnection,
} from '../../composables/use-validation';
import type { SocketProvider } from '../../types/socket-provider.model';
import { fileToBase64 } from '../../utils/http.helper';

export interface UseMcpPanelOptions {
  socketProvider: SocketProvider;
  model: Ref<string>;
  method: Ref<string>;
  task: Ref<string>;
  arguments_: Ref<string>;
  stream: Ref<boolean>;
  roomId: Ref<string>;
  numCtx: Ref<string>;
  event: Ref<string>;
  requestId: Ref<string>;
  isEventConnected: (eventName: string) => boolean;
  isRoomConnected: (eventName: string, roomName: string) => boolean;
  startConnectButtonBlink: () => void;
}

const VALID_TASKS = ['describe', 'compare', 'ocr'] as const;

export function useMcpPanel(options: UseMcpPanelOptions) {
  const {
    socketProvider,
    model,
    method,
    task,
    arguments_,
    stream,
    roomId,
    numCtx,
    event,
    requestId,
    isEventConnected,
    isRoomConnected,
    startConnectButtonBlink,
  } = options;

  const files = ref<File[]>([]);
  const loading = ref(false);
  const analyzeButtonHover = ref(false);
  const fileField = useBlink(1000);
  const modelField = useBlink(1000);
  const toast = useToast();

  const isAnalyzeDisabled = computed(
    () =>
      loading.value ||
      (method.value === 'visions.analyze' && !files.value.length),
  );

  function setFiles(newFiles: File[]) {
    files.value = newFiles;
  }

  function setAnalyzeButtonHover(value: boolean) {
    analyzeButtonHover.value = value;
    // Only blink the file field if no files are selected
    if (value && !files.value.length) fileField.start();
    else fileField.stop();

    // Blink the model field if it's empty
    if (value && !model.value) modelField.start();
    else modelField.stop();
  }

  function triggerFileFieldBlink() {
    if (!files.value.length) {
      fileField.blink(1000);
    }
  }

  async function submit() {
    loading.value = true;

    if (!requireModel(model, toast)) {
      loading.value = false;
      return;
    }

    if (!requireFiles(files, toast)) {
      loading.value = false;
      return;
    }

    if (
      !task.value.trim() ||
      !VALID_TASKS.includes(task.value as (typeof VALID_TASKS)[number])
    ) {
      toast.error('Task must be one of: "describe", "compare", or "ocr"');
      loading.value = false;
      return;
    }

    const eventName = event.value.trim();
    const room = roomId.value.trim();

    if (
      !validateConnection(
        eventName,
        room,
        isEventConnected,
        isRoomConnected,
        startConnectButtonBlink,
        toast,
      )
    ) {
      loading.value = false;
      return;
    }

    try {
      // Get preprocessing settings
      const preprocessingStore = usePreprocessingStore();
      const preprocessingSettings = preprocessingStore.buildMcpPreprocessing();

      const base64Images = await Promise.all(files.value.map(fileToBase64));

      // Build payload with preprocessing
      const payload = {
        id: 1,
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: method.value,
          arguments: {
            requestId: requestId.value,
            roomId: roomId.value,
            stream: stream.value,
            event: event.value.trim() || 'vision',
            numCtx: numCtx.value ? Number(numCtx.value) : undefined,
            model: model.value,
            prompt: [{ role: 'user', content: arguments_.value }],
            task: task.value,
            images: base64Images,
            preprocessing: preprocessingSettings,
          },
        },
      };

      socketProvider.addPendingMessage(
        eventName,
        roomId.value,
        requestId.value,
        task.value,
        stream.value,
      );

      const fetchPromise = fetch(getApiUrl('/api/v1/mcp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      socketProvider.trackRequest(
        getApiUrl('/api/v1/mcp'),
        'POST',
        fetchPromise,
        {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          requestId: requestId.value,
          roomId: roomId.value,
          event: event.value,
          numCtx: numCtx.value,
          stream: stream.value,
          model: model.value,
          preprocessing: JSON.stringify(preprocessingSettings),
        },
      );

      const socket = socketProvider.getSocket();
      const res = await fetchPromise;
      handleResponse(res, socket, toast);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      loading.value = false;
    }
  }

  return {
    files,
    loading,
    analyzeButtonHover,
    fileFieldBlinking: fileField.isBlinking,
    modelFieldBlinking: modelField.isBlinking,
    isAnalyzeDisabled,
    setFiles,
    setAnalyzeButtonHover,
    triggerFileFieldBlink,
    submit,
  };
}
