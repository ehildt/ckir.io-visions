<script lang="ts" setup>
import { useDebugColors } from './use-debug-colors';

defineProps<{
  method: string;
  requestId?: string;
  endpoint?: string;
}>();

const { getMethodColor } = useDebugColors();
</script>

<template>
  <span class="text-xs font-mono font-semibold" :class="getMethodColor(method)">
    {{ method }}
  </span>
  <span v-if="requestId" class="text-xs font-mono text-brand">
    {{ requestId }}
  </span>
  <span v-else class="text-xs font-mono text-fg-secondary">
    {{ endpoint }}
  </span>
</template>
