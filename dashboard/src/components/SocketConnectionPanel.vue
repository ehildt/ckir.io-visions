<script setup lang="ts">
import { computed } from 'vue';

import type { SocketProvider } from '../types/socket-provider.model';

const props = defineProps<{
  connectionState: 'connected' | 'disconnected' | 'error';
  socketProvider: SocketProvider;
  connectButtonBlinking: boolean;
  event: string;
  roomId: string;
}>();

const emit = defineEmits<{
  (e: 'connect', payload: { event: string; room?: string }): void;
  (e: 'closeEvent', eventName: string): void;
  (e: 'closeRoom', eventName: string, roomId: string): void;
  (e: 'update:event', value: string): void;
  (e: 'update:roomId', value: string): void;
}>();

const event = computed({
  get: () => props.event,
  set: (value) => emit('update:event', value),
});

const roomId = computed({
  get: () => props.roomId,
  set: (value) => emit('update:roomId', value),
});

function handleConnect() {
  emit('connect', { event: event.value, room: roomId.value || undefined });
}
</script>

<template>
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
        type="button"
        :class="[
          'px-4 py-2 h-[38px] bg-brand hover:bg-transparent hover:text-brand text-black font-bold text-sm rounded-none transition-all duration-200 font-mono border border-brand whitespace-nowrap',
          connectButtonBlinking ? 'animate-pulse ring-2 ring-warning' : '',
        ]"
        @click="handleConnect"
      >
        Connect
      </button>
    </div>

    <div
      v-if="socketProvider.getConnectedEventsAndRooms().length > 0"
      class="space-y-2"
    >
      <label
        class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
      >
        Subscribed
      </label>
      <div class="flex flex-wrap gap-2 text-xs">
        <template
          v-for="(item, idx) in socketProvider.getConnectedEventsAndRooms()"
          :key="idx"
        >
          <div class="flex items-center gap-1">
            <template v-if="item.includes('::')">
              <span
                class="px-2 py-1 bg-brand text-black font-mono rounded-none cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to close event and all its rooms"
                @click="emit('closeEvent', item.split('::')[0])"
              >
                {{ item.split('::')[0] }}
              </span>
              <template
                v-for="(room, rIdx) in item.split('::').slice(1)"
                :key="rIdx"
              >
                <span class="text-border">::</span>
                <span
                  class="px-2 py-1 bg-tertiary border border-divider text-fg-secondary font-mono rounded-none cursor-pointer hover:text-error transition-colors"
                  title="Click to close room"
                  @click="emit('closeRoom', item.split('::')[0], room)"
                >
                  {{ room }}
                </span>
              </template>
            </template>
            <template v-else>
              <span
                class="px-2 py-1 bg-brand text-black font-mono rounded-none cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to close event"
                @click="emit('closeEvent', item)"
              >
                {{ item }}
              </span>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
