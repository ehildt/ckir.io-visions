<script setup lang="ts">
import { computed, watch } from 'vue';

import { useLocalStorage } from '../../composables/use-local-storage';
import { useSocketSubscription } from '../../composables/use-socket-subscription';
import { useToast } from '../../composables/use-toast';
import { useAppStore } from '../../stores/app';
import type { SocketProvider } from '../../types/socket-provider.model';
import SocketPanel from '../socket/SocketPanel.vue';
import RestPanelRequestPanel from './RestPanel.RequestPanel.vue';
import { useRestPanel } from './use-rest-panel';

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
  ['event', 'roomId', 'task', 'model', 'numCtx', 'prompt', 'stream'],
  {
    event: '',
    roomId: '',
    task: 'describe',
    model: '',
    numCtx: '16384',
    prompt: 'Describe this image',
    stream: true,
  },
  'rest-fields',
);

const event = storage.event as import('vue').Ref<string>;
const roomId = storage.roomId as import('vue').Ref<string>;
const task = storage.task as import('vue').Ref<string>;
const model = storage.model as import('vue').Ref<string>;
const numCtx = storage.numCtx as import('vue').Ref<string>;
const prompt = storage.prompt as import('vue').Ref<string>;
const stream = storage.stream as import('vue').Ref<boolean>;

const appStore = useAppStore();
const requestId = computed(() => appStore.restRequestId);
const refreshRequestId = appStore.refreshRestRequestId;
const toast = useToast();
const {
  connectButtonBlinking,
  eventFieldBlinking,
  triggerEventFieldBlink,
  startConnectButtonBlink,
  stopConnectButtonBlink,
  startEventFieldBlink,
  stopEventFieldBlink,
  connect,
  isEventConnected,
  isRoomConnected,
} = useSocketSubscription(props.socketProvider);

const {
  loading,
  isAnalyzeDisabled,
  analyzeButtonHover,
  fileFieldBlinking,
  modelFieldBlinking,
  setFiles,
  setAnalyzeButtonHover,
  submit,
} = useRestPanel({
  socketProvider: props.socketProvider,
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
});

watch(model, () => {
  emit('model-selected');
});

watch(event, () => {
  stopConnectButtonBlink();
});

watch(analyzeButtonHover, (hovering) => {
  const eventName = event.value.trim();
  if (!hovering || !eventName) {
    stopConnectButtonBlink();
    return;
  }

  const roomName = roomId.value.trim();
  const needsSubscription =
    !isEventConnected(eventName) ||
    (roomName && !isRoomConnected(eventName, roomName));

  if (needsSubscription) {
    startConnectButtonBlink();
  } else {
    stopConnectButtonBlink();
  }
});

function handleConnect(payload: { event: string; room?: string }) {
  connect(payload.event, payload.room);
}

function handleUpdateEvent(value: string) {
  event.value = value;
}

function handleUpdateRoomId(value: string) {
  roomId.value = value;
}

function handleEventFieldBlink() {
  triggerEventFieldBlink();
}

function handleStartEventFieldBlink() {
  startEventFieldBlink();
}

function handleStopEventFieldBlink() {
  stopEventFieldBlink();
}

function handleSubscribeError() {
  toast.warning('Event name is required');
}

function handleCloseEvent(eventName: string) {
  props.socketProvider.closeEvent(eventName);
  event.value = '';
}

function handleCloseRoom(eventName: string, room: string) {
  props.socketProvider.closeRoom(eventName, room);
  roomId.value = '';
}
</script>

<template>
  <div class="space-y-3">
    <SocketPanel
      :socket-provider="socketProvider"
      :connection-state="connectionState"
      :connect-button-blinking="connectButtonBlinking"
      :event-field-blinking="eventFieldBlinking"
      :event="event"
      :room-id="roomId"
      @connect="handleConnect"
      @update:event="handleUpdateEvent"
      @update:room-id="handleUpdateRoomId"
      @event-field-blink="handleEventFieldBlink"
      @start-event-field-blink="handleStartEventFieldBlink"
      @stop-event-field-blink="handleStopEventFieldBlink"
      @subscribe-error="handleSubscribeError"
      @close-event="handleCloseEvent"
      @close-room="handleCloseRoom"
    />

    <RestPanelRequestPanel
      :socket-provider="socketProvider"
      :models="models"
      :models-loading="modelsLoading"
      :model="model"
      :task="task"
      :stream="stream"
      :num-ctx="numCtx"
      :prompt="prompt"
      :request-id="requestId"
      :is-analyze-disabled="isAnalyzeDisabled"
      :loading="loading"
      :button-blinking="connectButtonBlinking"
      :file-field-blinking="fileFieldBlinking"
      :model-field-blinking="modelFieldBlinking"
      @update:model="(value: string) => (model = value)"
      @update:task="(value: string) => (task = value)"
      @update:stream="(value: boolean) => (stream = value)"
      @update:num-ctx="(value: string) => (numCtx = value)"
      @update:prompt="(value: string) => (prompt = value)"
      @update:request-id="(value: string) => (requestId = value)"
      @refresh-models="emit('refresh-models')"
      @refresh-request-id="refreshRequestId"
      @files-change="setFiles"
      @submit="submit"
      @mouseenter="setAnalyzeButtonHover(true)"
      @mouseleave="setAnalyzeButtonHover(false)"
    />
  </div>
</template>
