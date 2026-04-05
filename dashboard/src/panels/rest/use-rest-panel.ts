import { computed, type Ref, ref } from 'vue';

import { getApiUrl } from '@/api/api-url';
import { usePreprocessingStore } from '@/stores/preprocessing';

import { useBlink } from '../../composables/use-blink';
import { handleResponse } from '../../composables/use-response-handler';
import { useToast } from '../../composables/use-toast';
import {
  requireModel,
  validateConnection,
} from '../../composables/use-validation';
import type { SocketProvider } from '../../types/socket-provider.model';
import {
  buildFormData,
  buildHeaders,
  buildQueryParams,
} from '../../utils/http.helper';
import { delay } from '../../utils/promise.helper';

export interface UseRestPanelOptions {
  socketProvider: SocketProvider;
  model: Ref<string>;
  task: Ref<string>;
  prompt: Ref<string>;
  stream: Ref<boolean>;
  roomId: Ref<string>;
  numCtx: Ref<string>;
  event: Ref<string>;
  requestId: Ref<string>;
  isEventConnected: (eventName: string) => boolean;
  isRoomConnected: (eventName: string, roomName: string) => boolean;
  startConnectButtonBlink: () => void;
}

export function useRestPanel(options: UseRestPanelOptions) {
  const {
    socketProvider,
    model,
    task,
    prompt,
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
    () => loading.value || !files.value.length,
  );

  function setFiles(newFiles: File[]) {
    files.value = newFiles;
  }

  function setAnalyzeButtonHover(value: boolean) {
    analyzeButtonHover.value = value;
    // Only blink the file field if no files are selected
    if (value && !files.value.length) {
      fileField.start();
    } else {
      fileField.stop();
    }
    // Blink the model field if it's empty
    if (value && !model.value) {
      modelField.start();
    } else {
      modelField.stop();
    }
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

    const socketEventName = eventName || 'vision';

    const socket = socketProvider.getSocket();
    if (!socket?.connected) await delay(500);

    let parsedPrompt: string | undefined;
    if (prompt.value.trim()) {
      parsedPrompt = JSON.stringify([{ role: 'user', content: prompt.value }]);
    }

    const formData = buildFormData(files.value, {
      task: task.value,
      prompt: parsedPrompt,
    });

    const preprocessingStore = usePreprocessingStore();
    const preprocessingParams = preprocessingStore.buildQueryParams();

    const params = buildQueryParams({
      requestId,
      roomId,
      stream,
      event,
      numCtx,
    });

    // Add preprocessing params if enabled
    Object.entries(preprocessingParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value);
      }
    });

    socketProvider.addPendingMessage(
      socketEventName,
      roomId.value,
      requestId.value,
      task.value,
      stream.value,
    );

    try {
      const headers = buildHeaders(model.value);

      const fetchPromise = fetch(
        getApiUrl(`/api/v1/vision?${params.toString()}`),
        {
          method: 'POST',
          headers,
          body: formData,
        },
      );

      socketProvider.trackRequest(
        getApiUrl(
          `/api/v1/vision${params.toString() ? '?' + params.toString() : ''}`,
        ),
        'POST',
        fetchPromise,
        {
          headers,
          formData,
          requestId: requestId.value,
          roomId: roomId.value,
          event: event.value,
          numCtx: numCtx.value,
          stream: stream.value,
          model: model.value,
          preprocessing: JSON.stringify(preprocessingParams),
        },
      );

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
