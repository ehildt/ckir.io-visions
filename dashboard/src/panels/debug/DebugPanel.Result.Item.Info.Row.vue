<script lang="ts" setup>
import {
  getMethodTabBorderColor,
  getMethodTabColor,
} from '../../utils/colors/method-colors.helper';

defineProps<{
  method: string;
  type: 'http' | 'socket';
  event?: string;
  roomId?: string;
  model?: string;
  requestId?: string;
  endpoint?: string;
}>();
</script>

<template>
  <!-- Method badge -->
  <span
    class="text-xs font-mono font-bold px-2 py-0.5 border"
    :class="[getMethodTabColor(method), getMethodTabBorderColor(method)]"
  >
    {{ method }}
  </span>

  <!-- For Socket: Show event name -->
  <span
    v-if="type === 'socket' && event"
    class="text-xs font-mono text-fg-primary truncate"
  >
    {{ event }}
  </span>

  <!-- For HTTP: Show requestId if available, else endpoint -->
  <span
    v-else-if="type === 'http' && requestId"
    class="text-xs font-mono text-tab-mcp truncate"
  >
    {{ requestId }}
  </span>
  <span v-else class="text-xs font-mono text-fg-secondary truncate">
    {{ endpoint }}
  </span>

  <!-- For Socket: Show roomId -->
  <span
    v-if="type === 'socket' && roomId"
    class="text-xs font-mono text-tab-mcp"
  >
    {{ roomId }}
  </span>

  <!-- Show model if available -->
  <span v-if="model" class="text-xs font-mono text-tab-rest">
    {{ model }}
  </span>
</template>
