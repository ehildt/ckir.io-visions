<script setup lang="ts">
defineProps<{
  messages: Array<{time: string; event: string; data: unknown}>;
}>();

function getEventColor(event: string): string {
  if (event.includes('error') || event.includes('Error')) {
    return 'text-[var(--color-accent-error)]';
  }
  if (event.includes('connect')) {
    return 'text-[var(--color-accent-success)]';
  }
  if (event === 'vision') {
    return 'text-[var(--color-accent-warning)]';
  }
  return 'text-[var(--color-accent-info)]';
}

function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}
</script>

<template>
  <div class="bg-[var(--color-bg-panel)] rounded-lg border border-[var(--color-border)] overflow-hidden h-full max-h-[calc(100vh-250px)]">
    <!-- Panel Header -->
    <div class="px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-[var(--color-accent-success)]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </span>
        <span class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
          Event Log
        </span>
      </div>
      <span 
        v-if="messages.length > 0"
        class="px-2 py-0.5 bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] text-xs font-mono rounded"
      >
        {{ messages.length }}
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="!messages.length" class="flex flex-col items-center justify-center py-12 px-4">
      <div class="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      <p class="text-sm text-[var(--color-text-muted)] font-mono">No events received yet</p>
      <p class="text-xs text-[var(--color-text-muted)]/70 mt-1 font-mono">Send a request to see the results</p>
    </div>

    <!-- Message List -->
    <div v-else class="overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-320px)]">
      <div 
        v-for="(msg, i) in messages" 
        :key="i"
        class="border border-[var(--color-border)] rounded-lg overflow-hidden"
      >
        <!-- Message Header -->
        <div class="px-3 py-2 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center gap-3">
          <span class="text-xs text-[var(--color-text-muted)] font-mono">{{ msg.time }}</span>
          <span 
            class="text-xs font-semibold font-mono px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)]"
            :class="getEventColor(msg.event)"
          >
            {{ msg.event }}
          </span>
        </div>
        
        <!-- Message Data -->
        <div class="p-3 bg-[var(--color-bg-primary)]">
          <pre class="text-xs font-mono text-[var(--color-text-primary)] whitespace-pre-wrap break-all">{{ formatJson(msg.data) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
