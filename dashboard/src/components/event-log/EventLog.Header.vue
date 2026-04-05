<script setup lang="ts">
import { ref } from 'vue';

import { useEventLog } from '../../composables/use-event-log';
import { useToast } from '../../composables/use-toast';
import EventLogPendingIndicator from '../pending-indicator/EventLog.PendingIndicator.vue';
import { ActionTagButton, UiTag } from '../ui';

defineProps<{
  message: { time: string; event: string; data: unknown };
  showStatus?: boolean;
  done?: boolean;
}>();

const emit = defineEmits<{
  (e: 'abort'): void;
  (e: 'copy'): void;
  (e: 'clear'): void;
}>();

const {
  getRoom,
  getEvent,
  getTask,
  getStream,
  isPending,
  isAborting,
  isAborted,
  isDone,
} = useEventLog();

const toast = useToast();

const cancelInitiated = ref(false);

function handleAbort() {
  cancelInitiated.value = true;
  toast.warning('Request canceled');
  emit('abort');
}

function handleCopy() {
  toast.success('Copied to clipboard');
  emit('copy');
}
</script>

<template>
  <div
    class="px-3 py-2 bg-secondary border-b border-divider flex items-center justify-between font-mono"
  >
    <div class="flex items-center gap-2">
      <span class="text-xs text-fg-muted">[{{ message.time }}]</span>
      <UiTag :label="getEvent(message.data) ?? message.event" color="rest" />
      <UiTag
        v-if="getRoom(message.data)"
        :label="getRoom(message.data)!"
        color="mcp"
      />
      <UiTag
        v-if="getTask(message.data)"
        :label="getTask(message.data)!"
        color="debug"
      />
      <UiTag v-if="getStream(message.data)" label="stream" color="rest" />
    </div>
    <div class="flex items-center gap-2">
      <EventLogPendingIndicator
        v-if="
          showStatus &&
          isPending(message.data) &&
          !isAborting(message.data) &&
          !cancelInitiated
        "
      />
      <EventLogPendingIndicator
        v-else-if="showStatus && (isAborting(message.data) || cancelInitiated)"
        variant="aborting"
      />

      <ActionTagButton
        v-if="
          showStatus &&
          isPending(message.data) &&
          !isAborting(message.data) &&
          !cancelInitiated
        "
        label="CNL"
        variant="rest"
        title="Cancel"
        @click="handleAbort"
      />
      <ActionTagButton
        v-if="
          (!isPending(message.data) && !isDone(message.data)) || !showStatus
        "
        label="CPY"
        variant="mcp"
        title="Copy"
        @click="handleCopy"
      />
      <ActionTagButton
        v-if="
          isDone(message.data) ||
          cancelInitiated ||
          isAborted(message.data) ||
          !showStatus
        "
        label="CLR"
        variant="debug"
        title="Clear"
        @click="emit('clear')"
      />
    </div>
  </div>
</template>
