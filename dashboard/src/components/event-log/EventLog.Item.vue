<script setup lang="ts">
import { useEventLog } from '../../composables/use-event-log';
import EventLogHeader from './EventLog.Header.vue';

const props = defineProps<{
  message: { time: string; event: string; data: unknown };
  index: number;
  copiedId: number | null;
}>();

const emit = defineEmits<{
  (e: 'abort', requestId: string): void;
  (e: 'copy', text: string, index: number): void;
  (e: 'clear', index: number): void;
}>();

const { getRequestId, isAborting, isPending, isDone, formatJson } =
  useEventLog();

function handleAbort() {
  const reqId = getRequestId(props.message.data);
  if (reqId) {
    emit('abort', reqId);
  }
}

function handleCopy() {
  emit('copy', formatJson(props.message.data), props.index);
}

const getShowStatus = () =>
  isPending(props.message.data) || isAborting(props.message.data);
const getIsDone = () => isDone(props.message.data);
</script>

<template>
  <div class="border border-divider">
    <EventLogHeader
      :message="message"
      :show-status="getShowStatus()"
      :done="getIsDone()"
      @abort="handleAbort"
      @copy="handleCopy"
      @clear="emit('clear', index)"
    />

    <div class="p-3 bg-primary">
      <pre
        class="text-xs font-mono text-fg-primary whitespace-pre-wrap break-word text-justify"
        :class="{ 'opacity-50': isPending(message.data) }"
        >{{ formatJson(message.data) }}</pre
      >
    </div>
  </div>
</template>
