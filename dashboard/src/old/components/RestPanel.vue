<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
  socketProvider: {
    getSocket: (event?: string, room?: string) => any;
    joinRoom?: (roomId: string, eventName: string) => void;
    leaveRoom?: (roomId: string, eventName: string) => void;
    listenToEvent?: (eventName: string) => void;
    stopListening?: () => void;
    trackRequest: (
      endpoint: string,
      method: string,
      promise: Promise<Response>,
      details?: {
        headers?: Record<string, string>;
        body?: string;
        formData?: FormData;
        requestId?: string;
        roomId?: string;
        event?: string;
        numCtx?: string;
        stream?: boolean;
        model?: string;
      },
    ) => Promise<Response>;
    addMessage: (event: string, data: unknown) => void;
    addPendingMessage: (
      event: string,
      roomId: string,
      requestId: string,
      task?: string,
      stream?: boolean,
    ) => void;
    updatePendingMessage: (requestId: string, data: unknown) => void;
    connectedEvents: { value: Set<string> };
    connectedRooms: { value: Map<string, Set<string>> };
    getConnectedEventsAndRooms: () => string[];
    closeEvent: (eventName: string) => void;
    closeRoom: (eventName: string, roomId: string) => void;
  };
  models: string[];
  modelsLoading: boolean;
  currentRoom: string;
  currentEvent: string;
  connectionState: 'connected' | 'disconnected' | 'error';
}>();

const emit = defineEmits<{
  (e: 'refresh-models'): void;
  (e: 'model-selected'): void;
}>();

const task = ref('describe');
const model = ref('');
const requestId = ref(`req-${Math.random().toString(36).substring(2, 11)}`);
const roomId = ref('');
const stream = ref(false);
const event = ref('vision');
const numCtx = ref('');
const prompt = ref('[{"role": "user", "content": "Describe this image"}]');
const files = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref('');
const connectButtonBlinking = ref(false);

function triggerConnectButtonBlink() {
  connectButtonBlinking.value = true;
  setTimeout(() => {
    connectButtonBlinking.value = false;
  }, 1500);
}

function refreshRequestId() {
  requestId.value = `req-${Math.random().toString(36).substring(2, 11)}`;
}

function clearFiles() {
  files.value = [];
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.files = null;
  }
}

onMounted(() => {
  // Load persisted field values
  const saved = localStorage.getItem('rest-fields');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.event) event.value = parsed.event;
      if (parsed.task) task.value = parsed.task;
      if (parsed.model) model.value = parsed.model;
      if (parsed.roomId) roomId.value = parsed.roomId;
      if (parsed.stream !== undefined) stream.value = parsed.stream;
      if (parsed.numCtx) numCtx.value = parsed.numCtx;
      if (parsed.prompt) prompt.value = parsed.prompt;
    } catch {}
  }
});

watch(model, () => {
  emit('model-selected');
});

watch([task, model, roomId, stream, event, numCtx, prompt], () => {
  localStorage.setItem(
    'rest-fields',
    JSON.stringify({
      task: task.value,
      model: model.value,
      roomId: roomId.value,
      stream: stream.value,
      event: event.value,
      numCtx: numCtx.value,
      prompt: prompt.value,
    }),
  );
});

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  files.value = Array.from(input.files || []);
}

function removeFile(index: number) {
  files.value.splice(index, 1);
}

async function connect() {
  const eventName = event.value.trim();
  const room = roomId.value.trim();
  if (!eventName) return;

  // Ensure socket is connected first
  const socket = props.socketProvider.getSocket();
  if (!socket?.connected) {
    console.warn('Socket not connected, waiting...');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Connect to event if not already connected
  if (!isEventConnected(eventName)) {
    props.socketProvider.listenToEvent?.(eventName);
  }

  // Connect to room if room is provided and not already connected
  if (room && !isRoomConnected(eventName, room)) {
    props.socketProvider.joinRoom?.(room, eventName);
  }
}

function isEventConnected(eventName: string): boolean {
  return props.socketProvider.connectedEvents.value.has(eventName);
}

function isRoomConnected(eventName: string, roomName: string): boolean {
  const rooms = props.socketProvider.connectedRooms.value.get(eventName);
  return rooms ? rooms.has(roomName) : false;
}

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
  if (!isEventConnected(eventName) || (room && !isRoomConnected(eventName, room))) {
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
  <div
    class="bg-elevated border border-divider panel-glow mb-3"
  >
    <div
      class="px-4 py-3 bg-secondary border-b border-divider"
    >
      <div class="flex items-center justify-between font-mono">
        <div class="flex items-center gap-2">
          <span class="text-brand text-sm font-bold"
            >&gt;</span
          >
          <span class="text-brand text-sm">Socket.io</span>
          <span class="text-fg-muted text-sm">/socket.io</span>
        </div>
        <span
          :class="{
            'text-success': connectionState === 'connected',
            'text-error': connectionState === 'disconnected' || connectionState === 'error',
          }"
          class="text-xs font-mono"
        >
          {{ connectionState }}
        </span>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div class="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Event
          </label>
          <input
            v-model="event"
            placeholder="vision"
            class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary placeholder-text-fg-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono"
          />
        </div>
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Room
          </label>
          <input
            v-model="roomId"
            placeholder="optional"
            class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary placeholder-text-fg-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono"
          />
        </div>
        <button
          :class="[
            'px-4 py-2 h-[38px] bg-brand hover:bg-transparent hover:text-brand text-black font-bold text-sm rounded-none transition-all duration-200 font-mono border border-brand whitespace-nowrap',
            connectButtonBlinking ? 'animate-pulse ring-2 ring-warning' : ''
          ]"
          @click="connect"
        >
          Connect
        </button>
      </div>

      <!-- Subscribed Events and Rooms -->
      <div v-if="socketProvider.getConnectedEventsAndRooms().length > 0" class="space-y-2">
        <label class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider">
          Subscribed
        </label>
        <div class="flex flex-wrap gap-2 text-xs">
          <template v-for="(item, idx) in socketProvider.getConnectedEventsAndRooms()" :key="idx">
            <div class="flex items-center gap-1">
              <template v-if="item.includes('::')">
                <span 
                  class="px-2 py-1 bg-brand text-black font-mono rounded-none cursor-pointer hover:opacity-80 transition-opacity"
                  title="Click to close event and all its rooms"
                  @click="socketProvider.closeEvent(item.split('::')[0])"
                >
                  {{ item.split('::')[0] }}
                </span>
                <template v-for="(room, rIdx) in item.split('::').slice(1)" :key="rIdx">
                  <span class="text-border">::</span>
                  <span 
                    class="px-2 py-1 bg-tertiary border border-divider text-fg-secondary font-mono rounded-none cursor-pointer hover:text-error transition-colors"
                    title="Click to close room"
                    @click="socketProvider.closeRoom(item.split('::')[0], room)"
                  >
                    {{ room }}
                  </span>
                </template>
              </template>
              <template v-else>
                <span 
                  class="px-2 py-1 bg-brand text-black font-mono rounded-none cursor-pointer hover:opacity-80 transition-opacity"
                  title="Click to close event"
                  @click="socketProvider.closeEvent(item)"
                >
                  {{ item }}
                </span>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <div
    class="bg-elevated border border-divider panel-glow"
  >
    <div
      class="px-4 py-3 bg-secondary border-b border-divider"
    >
      <div class="flex items-center gap-2 font-mono">
        <span class="text-brand text-sm font-bold"
          >&gt;</span
        >
        <span class="text-brand text-sm">POST</span>
        <span class="text-fg-muted text-sm"
          >/api/v1/vision</span
        >
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Model
          </label>
          <div class="flex gap-2">
            <select
              v-model="model"
              :disabled="modelsLoading || !models.length"
              class="flex-1 px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-0 transition-all font-mono appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {{
                  modelsLoading
                    ? 'Loading...'
                    : models.length
                      ? 'Select...'
                      : 'No models'
                }}
              </option>
              <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
            </select>
            <button
              :disabled="modelsLoading"
              class="px-2 py-2 bg-tertiary border border-divider rounded-none text-sm text-fg-secondary hover:text-fg-primary disabled:opacity-50 transition-all font-mono"
              title="Refresh"
              @click="emit('refresh-models')"
            >
              ↻
            </button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Task
          </label>
          <select
            v-model="task"
            class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono appearance-none cursor-pointer"
          >
            <option value="describe">describe</option>
            <option value="compare">compare</option>
            <option value="ocr">ocr</option>
          </select>
        </div>
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
              class="flex-1 px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-0 transition-all font-mono"
            />
            <button
              class="px-2 py-2 bg-tertiary border border-divider rounded-none text-sm text-fg-secondary hover:text-fg-primary transition-all font-mono"
              title="Refresh"
              @click="refreshRequestId"
            >
              ↻
            </button>
          </div>
        </div>
        <div class="space-y-1.5">
          <label
            class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
          >
            Stream
          </label>
          <select
            v-model="stream"
            class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono appearance-none cursor-pointer"
          >
            <option :value="false">false</option>
            <option :value="true">true</option>
          </select>
        </div>
      </div>

      <div class="space-y-1.5">
        <label
          class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
        >
          Images
        </label>
        <div v-if="!files.length" class="relative">
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/*"
            class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-brand file:text-black file:cursor-pointer"
            @change="handleFileChange"
          />
        </div>

        <div v-if="files.length" class="flex flex-wrap gap-2">
          <div
            v-for="(file, i) in files"
            :key="i"
            class="flex items-center gap-2 px-2 py-1 bg-tertiary border border-divider rounded text-xs font-mono"
          >
            <span class="text-fg-secondary">{{
              file.name
            }}</span>
            <button
              class="px-1.5 py-0.5 text-error hover:bg-error hover:text-fg-primary rounded transition-colors"
              @click="removeFile(i)"
            >
              ×
            </button>
          </div>
          <button
            class="px-2 py-1 text-xs text-fg-muted hover:text-error transition-colors font-mono"
            @click="clearFiles"
          >
            Clear all
          </button>
        </div>
      </div>

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
