<script lang="ts" setup>
import { useDebugColors } from './use-debug-colors';

defineProps<{
  status: 'success' | 'error';
}>();

const { getStatusColors } = useDebugColors();
</script>

<template>
  <div
    class="w-6 h-6 flex items-center justify-center shrink-0"
    :class="getStatusColors(status).indicatorBg"
  >
    <span
      class="text-sm font-bold"
      :class="getStatusColors(status).indicatorText"
    >
      {{ status === 'success' ? '✓' : '✗' }}
    </span>
  </div>
</template>
