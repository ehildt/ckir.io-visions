<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import RefreshButton from '../../components/buttons/RefreshButton.vue';
import DropDown from '../../components/drop-down/DropDown.vue';
import FileUpload from '../../components/file-upload/FileUpload.vue';
import SocketConnectionPanel from '../../components/SocketConnectionPanel.vue';
import { useLocalStorage } from '../../composables/use-local-storage';
import { useRequestId } from '../../composables/use-request-id';
import { useSocketConnect } from '../../composables/use-socket-connect';
import type { SocketProvider } from '../../types/socket-provider.model';

const props = defineProps<{
  socketProvider: SocketProvider;
  models: string[];
  modelsLoading: boolean;
  connectionState: 'connected' | 'disconnected' | 'error';
}>();

const emit = defineEmits<{
  (e: 'refresh-models'): void;
  (e: 'model-selected'): void;
}>();

const storage = useLocalStorage(
  ['event', 'roomId', 'task', 'model', 'numCtx', 'prompt'],
  {
    event: 'vision',
    roomId: '',
    task: 'describe',
    model: '',
    numCtx: '',
    prompt: '[{"role": "user", "content": "Describe this image"}]',
  },
  'rest-fields',
);

const event = storage.event as import('vue').Ref<string>;
const roomId = storage.roomId as import('vue').Ref<string>;
const task = storage.task as import('vue').Ref<string>;
const model = storage.model as import('vue').Ref<string>;
const numCtx = storage.numCtx as import('vue').Ref<string>;
const prompt = storage.prompt as import('vue').Ref<string>;
const stream = ref(false);

console.log('what we get in the line 35 - 41', {
  event,
  roomId,
  task,
  model,
  numCtx,
  prompt,
  stream,
});

const { requestId, refresh: refreshRequestId } = useRequestId();
const files = ref<File[]>([]);
const loading = ref(false);
const error = ref('');
const {
  connectButtonBlinking,
  triggerConnectButtonBlink,
  connect,
  isEventConnected,
  isRoomConnected,
} = useSocketConnect(props.socketProvider);

onMounted(() => {
  if (event.value) {
    props.socketProvider.listenToEvent?.(event.value);
  }
  if (roomId.value && event.value) {
    props.socketProvider.joinRoom?.(roomId.value, event.value);
  }
});

watch(model, () => {
  emit('model-selected');
});

async function submit() {
  error.value = '';
  loading.value = true;

  if (!model.value.trim()) {
    error.value = 'Model is required (e.g., llama3.2-vision, ministral-3:14b)';
    loading.value = false;
    return;
  }

  // Check if connected to the event and room
  const eventName = event.value.trim() || 'vision';
  const room = roomId.value.trim();
  console.log('submit function line 86', { eventName, room });
  if (
    !isEventConnected(eventName) ||
    (room && !isRoomConnected(eventName, room))
  ) {
    triggerConnectButtonBlink();
    loading.value = false;
    return;
  }

  // Get existing socket without triggering reconnect
  const socket = props.socketProvider.getSocket();
  if (!socket?.connected) {
    console.warn('Socket not connected, waiting...');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.log('Socket connected:', socket?.connected);

  const formData = new FormData();
  formData.append('task', task.value);

  console.log('Files to upload:', files.value.length);
  for (const file of files.value) {
    console.log('Appending file:', file.name, file.type, file.size);
    formData.append('images', file, file.name);
  }

  if (prompt.value.trim()) {
    try {
      JSON.parse(prompt.value);
      formData.append('prompt', prompt.value);
    } catch {
      error.value = 'Invalid JSON in prompt';
      loading.value = false;
      return;
    }
  }

  const params = new URLSearchParams();
  params.append('requestId', requestId.value);
  if (roomId.value) params.append('roomId', roomId.value);
  params.append('stream', stream.value ? 'true' : 'false');
  params.append('event', eventName);
  if (numCtx.value) params.append('numCtx', numCtx.value);

  props.socketProvider.addPendingMessage(
    eventName,
    roomId.value,
    requestId.value,
    task.value,
    stream.value,
  );

  console.log('FormData entries:');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(
        `  ${key}: File(${value.name}, ${value.type}, ${value.size})`,
      );
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  try {
    const headers = {
      'x-vision-llm': model.value,
      accept: 'application/json',
    };

    const fetchPromise = fetch(`/api/v1/vision?${params.toString()}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    props.socketProvider.trackRequest(
      `/api/v1/vision${params.toString() ? '?' + params.toString() : ''}`,
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
      },
    );

    const res = await fetchPromise;
    const text = await res.text();
    console.log('Response:', res.status, text);

    if (!res.ok) {
      error.value = `${res.status}: ${text}`;
    } else {
      refreshRequestId();
    }
  } catch (e: unknown) {
    console.error('Request failed:', e);
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- Socket.io Panel -->
  <div class="bg-elevated border border-divider panel-glow mb-3">
    <div class="px-4 py-3 bg-secondary border-b border-divider">
      <div class="flex items-center justify-between font-mono">
        <div class="flex items-center gap-2">
          <span class="text-brand text-sm font-bold">&gt;</span>
          <span class="text-brand text-sm">Socket.io</span>
          <span class="text-fg-muted text-sm">/socket.io</span>
        </div>
        <span
          :class="{
            'text-success': connectionState === 'connected',
            'text-error':
              connectionState === 'disconnected' || connectionState === 'error',
          }"
          class="text-xs font-mono"
        >
          {{ connectionState }}
        </span>
      </div>
    </div>

    <SocketConnectionPanel
      :connection-state="connectionState"
      :socket-provider="socketProvider"
      :connect-button-blinking="connectButtonBlinking"
      :event="event"
      :room-id="roomId"
      @connect="({ event: e, room: r }) => connect(e, r)"
      @update:event="event = $event"
      @update:room-id="roomId = $event"
      @close-event="socketProvider.closeEvent"
      @close-room="socketProvider.closeRoom"
    />
  </div>

  <div class="bg-elevated border border-divider panel-glow">
    <div class="px-4 py-3 bg-secondary border-b border-divider">
      <div class="flex items-center gap-2 font-mono">
        <span class="text-brand text-sm font-bold">&gt;</span>
        <span class="text-brand text-sm">POST</span>
        <span class="text-fg-muted text-sm">/api/v1/vision</span>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <DropDown
          label="Model"
          :selected="model"
          :options="models"
          :placeholder="
            modelsLoading
              ? 'Loading...'
              : models.length
                ? 'Select...'
                : 'No models'
          "
          :disabled="modelsLoading || !models.length"
          @update:selected="(value: string) => (model = value)"
        >
          <RefreshButton
            :disabled="modelsLoading"
            @click="emit('refresh-models')"
          />
        </DropDown>
        <DropDown
          label="Task"
          :selected="task"
          :options="['describe', 'compare', 'ocr']"
          @update:selected="(value: string) => (task = value)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Request ID
          </label>
          <div class="flex gap-2 items-center">
            <input
              v-model="requestId"
              class="flex-1 px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-0 transition-all font-mono"
            />
            <RefreshButton @click="refreshRequestId" />
          </div>
        </div>
        <DropDown
          label="Stream"
          :selected="String(stream)"
          :options="['false', 'true']"
          @update:selected="(value: string) => (stream = value === 'true')"
        />
      </div>

      <FileUpload @change="(newFiles: File[]) => (files = newFiles)" />

      <div class="space-y-1.5">
        <label
          class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
        >
          Prompt (JSON)
          <span class="text-fg-muted">(optional)</span>
        </label>
        <textarea
          v-model="prompt"
          rows="3"
          placeholder='[{"role": "user", "content": "..."}]'
          class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary placeholder-text-fg-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono resize-none"
        ></textarea>
      </div>

      <button
        :disabled="loading || !files.length"
        class="w-full px-4 py-2.5 bg-brand hover:bg-brand-muted disabled:bg-tertiary disabled:text-fg-muted disabled:cursor-not-allowed text-fg-primary font-medium text-sm rounded-none transition-all duration-200 font-mono"
        @click="submit"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span
            class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
          ></span>
          Sending...
        </span>
        <span v-else>Send Request</span>
      </button>

      <div
        v-if="error"
        class="px-3 py-2 bg-error/10 border border-error/30 rounded-none"
      >
        <p class="text-sm text-error font-mono">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
