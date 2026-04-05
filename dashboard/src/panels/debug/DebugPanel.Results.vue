<script lang="ts" setup>
import type { DebugResult } from '../../types/debug.model';
import DebugPanelResultItem from './DebugPanel.Result.Item.vue';

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
      'cursor-pointer hover:bg-tertiary/50 divide-y divide-border',
      { 'bg-tertiary': selectedResultId === result.id },
    ]"
    @click="$emit('select', result)"
  >
    <DebugPanelResultItem :result="result" />
  </div>
</template>
