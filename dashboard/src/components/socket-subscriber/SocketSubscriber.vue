<script setup lang="ts">
import { computed } from 'vue';

import { useSocketSubscription } from '../../composables/use-socket-subscription';
import type { ConnectionState } from '../../stores/socket';
import type { SocketProvider } from '../../types/socket-provider.model';
import SocketSubscriberFieldInputEvent from './SocketSubscriber.Field.Input.Event.vue';
import SocketSubscriberFieldInputRoom from './SocketSubscriber.Field.Input.Room.vue';
import SocketSubscriberField from './SocketSubscriber.Field.vue';
import SocketSubscriberSubscribeButton from './SocketSubscriber.SubscribeButton.vue';

const props = defineProps<{
  connectionState: ConnectionState;
  socketProvider: SocketProvider;
  connectButtonBlinking: boolean;
  eventFieldBlinking: boolean;
  event: string;
  roomId: string;
}>();

const emit = defineEmits<{
  (e: 'connect', payload: { event: string; room?: string }): void;
  (e: 'closeEvent', eventName: string): void;
  (e: 'closeRoom', eventName: string, roomId: string): void;
  (e: 'update:event', value: string): void;
  (e: 'update:roomId', value: string): void;
  (e: 'eventFieldBlink'): void;
  (e: 'startEventFieldBlink'): void;
  (e: 'stopEventFieldBlink'): void;
  (e: 'subscribeError'): void;
}>();

// Reactive refs for composable
const eventRef = computed(() => props.event);
const roomIdRef = computed(() => props.roomId);
const connectButtonBlinkingRef = computed(() => props.connectButtonBlinking);
const eventFieldBlinkingRef = computed(() => props.eventFieldBlinking);
const connectionStateRef = computed(() => props.connectionState);

const { isSubscribeDisabled, buttonBlinking } = useSocketSubscription(
  props.socketProvider,
  {
    event: eventRef,
    roomId: roomIdRef,
    connectButtonBlinking: connectButtonBlinkingRef,
    eventFieldBlinking: eventFieldBlinkingRef,
    connectionState: connectionStateRef,
  },
);

function handleConnect() {
  if (!props.event.trim()) {
    emit('eventFieldBlink');
    emit('subscribeError');
    return;
  }
  emit('connect', { event: props.event, room: props.roomId || undefined });
}

function handleButtonMouseenter() {
  if (isSubscribeDisabled.value) {
    emit('startEventFieldBlink');
  }
}

function handleButtonMouseleave() {
  if (isSubscribeDisabled.value) {
    emit('stopEventFieldBlink');
  }
}
</script>

<template>
  <div class="p-4 space-y-3">
    <div class="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <SocketSubscriberField label="Event">
        <SocketSubscriberFieldInputEvent
          :model-value="props.event"
          placeholder="required"
          :blinking="props.eventFieldBlinking"
          @blink="emit('eventFieldBlink')"
          @update:model-value="emit('update:event', $event)"
        />
      </SocketSubscriberField>
      <SocketSubscriberField label="Room">
        <SocketSubscriberFieldInputRoom
          :model-value="props.roomId"
          placeholder="optional"
          @update:model-value="emit('update:roomId', $event)"
        />
      </SocketSubscriberField>
      <SocketSubscriberSubscribeButton
        :disabled="isSubscribeDisabled"
        :blinking="buttonBlinking"
        @click="handleConnect"
        @mouseenter="handleButtonMouseenter"
        @mouseleave="handleButtonMouseleave"
      />
    </div>
  </div>
</template>
