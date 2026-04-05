<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

import SocketSubscriber from '../../components/socket-subscriber/SocketSubscriber.vue';
import type { ConnectionState } from '../../stores/socket';
import type { SocketProvider } from '../../types/socket-provider.model';

defineProps<{
  socketProvider: SocketProvider;
  connectionState: ConnectionState;
  connectButtonBlinking: boolean;
  eventFieldBlinking: boolean;
  event: string;
  roomId: string;
}>();

const emit = defineEmits<{
  (e: 'update:event', value: string): void;
  (e: 'update:roomId', value: string): void;
  (e: 'connect', payload: { event: string; room?: string }): void;
  (e: 'eventFieldBlink'): void;
  (e: 'startEventFieldBlink'): void;
  (e: 'stopEventFieldBlink'): void;
  (e: 'subscribeError'): void;
  (e: 'closeEvent', eventName: string): void;
  (e: 'closeRoom', eventName: string, room: string): void;
}>();

function handleConnect(payload: { event: string; room?: string }) {
  emit('connect', payload);
}

function handleUpdateEvent(value: string) {
  emit('update:event', value);
}

function handleUpdateRoomId(value: string) {
  emit('update:roomId', value);
}

function handleEventFieldBlink() {
  emit('eventFieldBlink');
}

function handleStartEventFieldBlink() {
  emit('startEventFieldBlink');
}

function handleStopEventFieldBlink() {
  emit('stopEventFieldBlink');
}

function handleSubscribeError() {
  emit('subscribeError');
}

function handleCloseEvent(eventName: string) {
  emit('closeEvent', eventName);
}

function handleCloseRoom(eventName: string, room: string) {
  emit('closeRoom', eventName, room);
}
</script>

<template>
  <div class="bg-elevated border border-divider panel-glow mb-3">
    <div class="px-4 py-3 bg-secondary border-b border-divider">
      <div class="flex items-center justify-between font-mono">
        <div class="flex items-center gap-2">
          <ChevronRight class="w-4 h-4 text-accent-primary" />
          <span class="text-accent-primary text-sm">Socket.io</span>
          <span class="text-fg-muted text-sm">/socket.io</span>
        </div>
      </div>
    </div>

    <SocketSubscriber
      :connection-state="connectionState"
      :socket-provider="socketProvider"
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
  </div>
</template>
