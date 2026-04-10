<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { SocketProvider } from '../../types/socket-provider.model';

const props = defineProps<{
  socketProvider: SocketProvider;
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

const method = ref('visions.analyze');
const model = ref('');
const event = ref('vision');
const requestId = ref(`req-${Math.random().toString(36).substring(2, 11)}`);
const roomId = ref('');
const stream = ref(false);
const arguments_ = ref(
  '{"prompt": [{"role": "user", "content": "Describe this image"}], "task": "describe"}',
);
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
  const saved = localStorage.getItem('mcp-fields');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.method) method.value = parsed.method;
      if (parsed.model) model.value = parsed.model;
      if (parsed.roomId) roomId.value = parsed.roomId;
      if (parsed.stream !== undefined) stream.value = parsed.stream;
      if (parsed.arguments_) arguments_.value = parsed.arguments_;
      if (parsed.event) event.value = parsed.event;
    } catch {}
  }
});

watch(model, () => {
  emit('model-selected');
});

watch([method, roomId, stream, arguments_, event], () => {
  localStorage.setItem(
    'mcp-fields',
    JSON.stringify({
      method: method.value,
      model: model.value,
      roomId: roomId.value,
      stream: stream.value,
      arguments_: arguments_.value,
      event: event.value,
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

  if (method.value === 'visions.analyze' && !model.value.trim()) {
    error.value =
      'Model is required for visions.analyze (e.g., llama3.2-vision, ministral-3:14b)';
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

  let args: unknown;
  try {
    args = JSON.parse(arguments_.value);
  } catch {
    error.value = 'Invalid JSON in arguments';
    loading.value = false;
    return;
  }

  let rpcRequest;
  if (method.value === 'initialize') {
    rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'visions-webapp', version: '1.0.0' },
      },
    };
  } else if (method.value === 'tools/list') {
    rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    };
  } else if (method.value === 'visions.analyze') {
    rpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'visions.analyze',
        arguments: args,
      },
    };
  } else {
    error.value = 'Unknown method';
    loading.value = false;
    return;
  }

  const formData = new FormData();
  formData.append('payload', JSON.stringify(rpcRequest));

  for (const file of files.value) {
    formData.append('images', file);
  }

  const params = new URLSearchParams({
    requestId: requestId.value,
  });

  if (roomId.value) params.append('roomId', roomId.value);
  if (stream.value) params.append('stream', 'true');
  if (event.value) params.append('event', event.value);

  // Extract task from args if available
  const taskFromArgs = (args as any)?.prompt?.[0]?.task || method.value;
  
  props.socketProvider.addPendingMessage(
    event.value,
    roomId.value,
    requestId.value,
    taskFromArgs,
    stream.value,
  );

  try {
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
              class="flex-1 px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
