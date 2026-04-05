<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  messages: Array<{ time: string; event: string; data: unknown }>;
  abortingId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'abort', requestId: string): void;
}>();

const copiedId = ref<number | null>(null);

function getEventColor(event: string): string {
  if (event.includes('error') || event.includes('Error')) {
    return 'text-error';
  }
  if (event.includes('connect')) {
    return 'text-success';
  }
  if (event.includes('abort')) {
    return 'text-error';
  }
  return 'text-warning';
}

function formatJson(data: unknown): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (
      'message' in d &&
      d.message &&
      typeof d.message === 'object' &&
      'content' in (d.message as any)
    ) {
      return (d.message as any).content;
    }
    const { pending, ...rest } = d;
    return JSON.stringify(rest, null, 2);
  }
  return JSON.stringify(data, null, 2);
}

function getRoom(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'roomId' in data) {
    return (data as { roomId?: string }).roomId;
  }
  return undefined;
}

function getEvent(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'event' in data) {
    return (data as { event?: string }).event;
  }
  return undefined;
}

function getRequestId(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'requestId' in data) {
    return (data as { requestId?: string }).requestId;
  }
  return undefined;
}

function getTask(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'task' in data) {
    return (data as { task?: string }).task;
  }
  return undefined;
}

function getStream(data: unknown): boolean | undefined {
  if (data && typeof data === 'object' && 'stream' in data) {
    return (data as { stream?: boolean }).stream;
  }
  return undefined;
}

function isPending(data: unknown): boolean {
  return !!(
    data &&
    typeof data === 'object' &&
    'pending' in (data as any) &&
    (data as any).pending === true
  );
}

function isAborted(data: unknown): boolean {
  return !!(
    data &&
    typeof data === 'object' &&
    'aborted' in (data as any) &&
    (data as any).aborted === true
  );
}

function isAborting(data: unknown): boolean {
  const reqId = getRequestId(data);
  return !!reqId && reqId === props.abortingId;
}

function isComplete(data: unknown): boolean {
  return !isPending(data) && !isAborted(data) && !isAborting(data);
}

function copyToClipboard(text: string, index: number) {
  navigator.clipboard.writeText(text).then(() => {
    copiedId.value = index;
    setTimeout(() => {
      copiedId.value = null;
    }, 1500);
  });
}

function handleAbort(requestId: string) {
  console.log('[DEBUG] handleAbort called with requestId:', requestId);
  emit('abort', requestId);
}
</script>

<template>
  <div
    class="bg-elevated border border-divider panel-glow h-full flex flex-col"
  >
    <div
      class="px-4 py-3 bg-secondary border-b border-divider flex items-center justify-between"
    >
      <div class="flex items-center gap-2 font-mono">
        <span class="text-brand">&gt;</span>
        <span
          class="text-xs text-brand uppercase tracking-wider"
          >Event Log</span
        >
      </div>
      <div class="flex items-center gap-3">
        <span
          v-if="messages.length > 0"
          class="px-2 py-0.5 text-xs font-mono text-brand border border-brand"
        >
          {{ messages.length }}
        </span>
        <button
          v-if="messages.length > 0"
          class="px-2 py-1 text-xs font-mono text-error hover:bg-error hover:text-black transition-colors border border-error"
          @click="emit('clear')"
        >
          [CLR]
        </button>
      </div>
    </div>

    <div
      v-if="!messages.length"
      class="flex flex-col items-center justify-center flex-1 px-4"
    >
      <p class="text-sm text-fg-muted font-mono">
        _ waiting for events
      </p>
    </div>

    <div v-else class="overflow-y-auto p-4 space-y-2 flex-1">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="border border-divider"
      >
        <div
          class="px-3 py-2 bg-secondary border-b border-divider flex items-center gap-2 font-mono"
        >
          <span class="text-xs text-fg-muted"
            >[{{ msg.time }}]</span
          >
          <span
            class="text-xs font-bold px-2 py-0.5 border"
            :class="getEventColor(getEvent(msg.data) ?? msg.event)"
          >
            {{ getEvent(msg.data) ?? msg.event }}
          </span>
          <span
            v-if="getRoom(msg.data)"
            class="text-xs font-bold px-2 py-0.5 border border-info/50 text-info"
          >
            {{ getRoom(msg.data) }}
          </span>
          <span
            v-if="getTask(msg.data)"
            class="text-xs font-bold px-2 py-0.5 border border-warning/50 text-warning"
          >
            {{ getTask(msg.data) }}
          </span>
          <span
            v-if="getStream(msg.data)"
            class="text-xs font-bold px-2 py-0.5 border border-brand/50 text-brand"
          >
            stream
          </span>
          <div
            v-if="isAborted(msg.data)"
            class="flex items-center gap-1.5 text-xs text-error"
          >
            CANCELED
          </div>
          <span
            v-else-if="isAborting(msg.data)"
            class="text-xs font-bold px-2 py-0.5 border border-error text-error flex items-center gap-1.5"
          >
            <span
              class="w-8 h-1.5 relative overflow-hidden bg-tertiary"
            >
              <span
                class="absolute top-0 left-0 h-full w-1/2 bg-error animate-battery-slide"
              ></span>
            </span>
            ABORTING
          </span>
          <span
            v-else-if="isPending(msg.data)"
            class="text-xs font-bold px-2 py-0.5 border border-brand text-brand flex items-center gap-1.5"
          >
            <span
              class="w-8 h-1.5 relative overflow-hidden bg-tertiary"
            >
              <span
                class="absolute top-0 left-0 h-full w-1/2 bg-warning animate-battery-slide"
              ></span>
            </span>
            PENDING
          </span>
          <button
            v-if="
              getRequestId(msg.data) &&
              !isComplete(msg.data) &&
              !isAborting(msg.data)
            "
            :disabled="abortingId === getRequestId(msg.data)"
            class="ml-auto px-2 py-0.5 text-xs text-fg-muted hover:text-error active:scale-95 active:opacity-70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :title="'Cancel this job'"
            @click="handleAbort(getRequestId(msg.data)!)"
          >
            [CANCEL]
          </button>
          <button
            v-else-if="getRequestId(msg.data) && isComplete(msg.data)"
            class="ml-auto px-2 py-0.5 text-xs text-fg-muted hover:text-brand active:scale-95 active:opacity-70 transition-all"
            :title="copiedId === i ? 'Copied!' : 'Copy to clipboard'"
            @click="copyToClipboard(formatJson(msg.data), i)"
          >
            [Copy]
          </button>
        </div>

        <div class="p-3 bg-primary">
          <pre
            class="text-xs font-mono text-fg-primary whitespace-pre-wrap break-word text-justify"
            :class="{ 'opacity-50': isPending(msg.data) }"
            >{{ formatJson(msg.data) }}</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>
