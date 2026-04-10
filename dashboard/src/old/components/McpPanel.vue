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
  ['event', 'roomId', 'method', 'model', 'arguments_'],
  {
    event: 'vision',
    roomId: '',
    method: 'visions.analyze',
    model: '',
    arguments_:
      '{"prompt": [{"role": "user", "content": "Describe this image"}], "task": "describe"}',
  },
  'mcp-fields',
);

const event = storage.event as import('vue').Ref<string>;
const roomId = storage.roomId as import('vue').Ref<string>;
const method = storage.method as import('vue').Ref<string>;
const model = storage.model as import('vue').Ref<string>;
const arguments_ = storage.arguments_ as import('vue').Ref<string>;
const stream = ref(false);

const { requestId, refresh: refreshRequestId } = useRequestId();
const files = ref<File[]>([]);
const loading = ref(false);
const error = ref('');
const { connectButtonBlinking, connect } = useSocketConnect(
  props.socketProvider,
);

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

  if (!files.value.length) {
    error.value = 'At least one image is required';
    loading.value = false;
    return;
  }

  try {
    const params = new URLSearchParams({
      method: method.value,
      requestId: requestId.value,
      roomId: roomId.value,
      stream: stream.value.toString(),
    });

    const formData = new FormData();
    for (const file of files.value) {
      formData.append('file', file);
    }
    formData.append('arguments', arguments_.value);

    const fetchPromise = fetch(`/api/v1/mcp?${params.toString()}`, {
      method: 'POST',
      headers: { 'x-vision-llm': model.value },
      body: formData,
    });

    const headers = { 'x-vision-llm': model.value };
    props.socketProvider.trackRequest(`/api/v1/mcp`, 'POST', fetchPromise, {
      headers,
      formData,
      requestId: requestId.value,
      roomId: roomId.value,
      event: event.value,
      stream: stream.value,
      model: model.value,
    });

    const res = await fetchPromise;
    const text = await res.text();

    if (!res.ok) {
      error.value = `${res.status}: ${text}`;
    } else {
      refreshRequestId();
    }
  } catch (e: unknown) {
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
        <span class="text-fg-muted text-sm">/api/v1/mcp</span>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Method
          </label>
          <select
            v-model="method"
            class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono appearance-none cursor-pointer"
          >
            <option value="initialize">initialize</option>
            <option value="tools/list">tools/list</option>
            <option value="visions.analyze">visions.analyze</option>
          </select>
        </div>

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
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Request ID
          </label>
          <div class="flex gap-2">
            <input
              v-model="requestId"
              class="flex-1 px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono"
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
          Arguments (JSON)
        </label>
        <textarea
          v-model="arguments_"
          rows="3"
          placeholder='{"prompt": [...], "task": "describe"}'
          class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary placeholder-text-fg-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono resize-none"
        ></textarea>
      </div>

      <button
        :disabled="loading || (method === 'visions.analyze' && !files.length)"
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
