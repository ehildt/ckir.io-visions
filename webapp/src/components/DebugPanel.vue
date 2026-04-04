<script setup lang="ts">
defineProps<{
  results: Array<{
    id: string;
    timestamp: string;
    endpoint: string;
    method: string;
    status: "success" | "error";
    statusCode?: number;
    errorMessage?: string;
    responseTime: number;
    type: "http" | "socket";
  }>;
}>();

defineEmits<{
  (e: "clear"): void;
}>();

function getMethodColor(method: string): string {
  switch (method) {
    case "POST": return "text-[var(--color-accent-primary)]";
    case "GET": return "text-[var(--color-accent-success)]";
    case "PUT": return "text-[var(--color-accent-warning)]";
    case "DELETE": return "text-[var(--color-accent-error)]";
    case "CONNECT": return "text-[var(--color-accent-success)]";
    case "DISCONNECT": return "text-[var(--color-text-muted)]";
    case "CONNECT_ERROR": return "text-[var(--color-accent-error)]";
    default: return "text-[var(--color-text-secondary)]";
  }
}
</script>

<template>
  <div class="bg-[var(--color-bg-panel)] rounded-lg border border-[var(--color-border)] overflow-hidden">
    <!-- Panel Header -->
    <div class="px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-[var(--color-accent-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
        <span class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
          Request Log
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-[var(--color-text-muted)] font-mono">
          {{ results.filter(r => r.type === 'http').length }} HTTP | 
          {{ results.filter(r => r.type === 'socket').length }} Socket
        </span>
        <button 
          @click="$emit('clear')"
          class="px-2 py-1 text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-error)] transition-colors"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!results.length" class="flex flex-col items-center justify-center py-12 px-4">
      <div class="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-sm text-[var(--color-text-muted)] font-mono">No requests yet</p>
      <p class="text-xs text-[var(--color-text-muted)]/70 mt-1 font-mono">Send a request to see results</p>
    </div>

    <!-- Results List -->
    <div v-else class="max-h-[600px] overflow-y-auto">
      <div 
        v-for="result in results" 
        :key="result.id"
        class="border-b border-[var(--color-border)] last:border-0"
      >
        <div 
          class="px-4 py-3 flex items-center gap-3"
          :class="result.status === 'success' 
            ? 'bg-[var(--color-accent-success)]/5' 
            : 'bg-[var(--color-accent-error)]/5'"
        >
          <!-- Status Indicator -->
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            :class="result.status === 'success'
              ? 'bg-[var(--color-accent-success)]/20'
              : 'bg-[var(--color-accent-error)]/20'"
          >
            <span 
              class="text-sm font-bold"
              :class="result.status === 'success'
                ? 'text-[var(--color-accent-success)]'
                : 'text-[var(--color-accent-error)]'"
            >
              {{ result.status === 'success' ? '✓' : '✗' }}
            </span>
          </div>

          <!-- Request Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <!-- Type Badge -->
              <span 
                class="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase"
                :class="result.type === 'socket'
                  ? 'bg-[var(--color-accent-warning)]/20 text-[var(--color-accent-warning)]'
                  : 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]'"
              >
                {{ result.type }}
              </span>
              <span class="text-xs font-mono font-semibold" :class="getMethodColor(result.method)">
                {{ result.method }}
              </span>
              <span class="text-xs font-mono text-[var(--color-text-secondary)] truncate">
                {{ result.endpoint }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)]">
              <span>{{ result.timestamp }}</span>
              <span v-if="result.responseTime > 0">{{ result.responseTime }}ms</span>
              <span v-if="result.statusCode" :class="{
                'text-[var(--color-accent-success)]': result.statusCode >= 200 && result.statusCode < 300,
                'text-[var(--color-accent-error)]': result.statusCode >= 400
              }">
                {{ result.statusCode }}
              </span>
            </div>
          </div>
        </div>

        <!-- Success Message for Socket -->
        <div 
          v-if="result.status === 'success' && result.type === 'socket' && result.method === 'CONNECT'" 
          class="px-4 py-2 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)]"
        >
          <p class="text-xs font-mono text-[var(--color-accent-success)]">
            Connected successfully!
          </p>
        </div>

        <!-- Error Message -->
        <div 
          v-if="result.status === 'error' && result.errorMessage" 
          class="px-4 py-2 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)]"
        >
          <p class="text-xs font-mono text-[var(--color-accent-error)]">
            {{ result.errorMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
