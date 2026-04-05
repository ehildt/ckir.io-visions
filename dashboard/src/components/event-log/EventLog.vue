<script setup lang="ts">
import { ref } from 'vue';

import { useAutoScroll } from '../../composables/use-auto-scroll';
import { useEventLog } from '../../composables/use-event-log';
import { PanelHeader } from '../ui';
import EventLogItem from './EventLog.Item.vue';

const props = defineProps<{
  messages: Array<{ time: string; event: string; data: unknown }>;
}>();

const emit = defineEmits<{
  (e: 'abort', requestId: string): void;
  (e: 'copy', text: string, index: number): void;
  (e: 'clearIndex', index: number): void;
}>();

const { copiedId } = useEventLog();

const scrollContainerRef = ref<HTMLElement | null>(null);
useAutoScroll(scrollContainerRef, () => props.messages.length);

function handleAbort(requestId: string) {
  emit('abort', requestId);
}

function handleClear(index: number) {
  emit('clearIndex', index);
}
</script>

<template>
  <div
    class="bg-elevated border border-divider panel-glow h-full flex flex-col"
  >
    <PanelHeader title="Event Log" :count="messages.length" />

    <div
      v-if="!messages.length"
      class="flex flex-col items-center justify-center flex-1 px-4 min-h-[100px]"
    >
      <p class="text-sm text-fg-muted font-mono">_ waiting for events</p>
    </div>

    <div
      v-else
      ref="scrollContainerRef"
      class="p-4 space-y-2 flex-1 overflow-y-auto"
    >
      <EventLogItem
        v-for="(msg, i) in messages"
        :key="
          (msg.data as any).requestId +
          '-' +
          ((msg.data as any).message?.content?.length || 0) +
          '-' +
          i
        "
        :message="msg"
        :index="i"
        :copied-id="copiedId"
        @abort="handleAbort"
        @copy="(text, idx) => emit('copy', text, idx)"
        @clear="handleClear"
      />
    </div>
  </div>
</template>
