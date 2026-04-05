<script setup lang="ts">
import { Upload } from 'lucide-vue-next';

defineProps<{
  disabled?: boolean;
  blinking?: boolean;
}>();
</script>

<template>
  <span
    :class="[
      'absolute inset-0 flex items-center justify-between px-3 border border-divider bg-secondary text-sm font-mono text-fg-muted pointer-events-none h-9.5',
      blinking ? 'animate-pulse ring-2 ring-tab-rest' : '',
    ]"
  >
    <span v-if="disabled">Browse</span>
    <span v-else>Select files...</span>
    <Upload class="w-4 h-4 shrink-0" />
  </span>
</template>
