<script lang="ts" setup>
defineProps<{ message?: string; submessage?: string }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <div class="w-12 h-12 bg-tertiary flex items-center justify-center mb-3">
      <svg
        class="w-6 h-6 text-fg-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <p class="text-sm text-fg-muted font-mono">
      {{ message || 'No requests yet' }}
    </p>
    <p v-if="submessage" class="text-xs text-fg-muted/70 mt-1 font-mono">
      {{ submessage }}
    </p>
    <p v-else class="text-xs text-fg-muted/70 mt-1 font-mono">
      Send a request to see results
    </p>
  </div>
</template>
