<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

defineProps<{
  endpoint: string;
  method?: string;
}>();
</script>

<template>
  <div class="px-4 py-3 bg-secondary border-b border-divider">
    <div class="flex items-center gap-2 font-mono">
      <ChevronRight class="w-4 h-4 text-accent-primary" />
      <span class="text-accent-primary text-sm">{{ method || 'POST' }}</span>
      <span class="text-fg-muted text-sm">{{ endpoint }}</span>
    </div>
  </div>
</template>
