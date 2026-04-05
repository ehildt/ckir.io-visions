<script lang="ts" setup>
import { useDebugColors } from './use-debug-colors';

defineProps<{
  timestamp: string;
  responseTime?: number;
  statusCode?: number;
}>();

const { getStatusCodeColor } = useDebugColors();
</script>

<template>
  <span>{{ timestamp }}</span>
  <span v-if="responseTime && responseTime > 0">{{ responseTime }}ms</span>
  <span v-if="statusCode" :class="getStatusCodeColor(statusCode)">
    {{ statusCode }}
  </span>
</template>
