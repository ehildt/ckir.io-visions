<script lang="ts" setup>
import type { DebugResult } from './debug-result.model';
import DebugPanelResultItem from './DebugPanelResultItem.vue';

defineProps<{
  selectedResultId: string;
  results: Array<DebugResult>;
}>();

defineEmits<{
  (e: 'select', result: DebugResult): void;
}>();
</script>

<template>
  <div
    v-for="result in results"
    :key="result.id"
    :class="[
      'cursor-pointer hover:bg-tertiary/50 divide-y divide-border overflow-y-auto max-h-[calc(100vh-350px)]',
      { 'bg-tertiary': selectedResultId === result.id },
    ]"
    @click="$emit('select', result)"
  >
    <DebugPanelResultItem :result="result" />
  </div>
</template>
