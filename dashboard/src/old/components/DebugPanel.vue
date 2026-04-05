<script setup lang="ts">
import { computed, ref } from 'vue';

import type { DebugResult } from '../../panels/debug/debug-result.model';
import DebugPanelEmptyState from '../../panels/debug/DebugPanelEmptyState.vue';
import DebugPanelHeader from '../../panels/debug/DebugPanelHeader.vue';
import DebugPanelHeaderMenu from '../../panels/debug/DebugPanelHeaderMenu.vue';
import DebugPanelHeaderTitle from '../../panels/debug/DebugPanelHeaderTitle.vue';
import DebugPanelLayout from '../../panels/debug/DebugPanelLayout.vue';
import DebugPanelResults from '../../panels/debug/DebugPanelResults.vue';

const props = defineProps<{
  results: DebugResult[];
  selectedResult: DebugResult | null;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'select', result: DebugResult | null): void;
}>();

const filter = ref<'all' | 'http' | 'socket'>('all');

const filteredResults = computed(() => {
  if (filter.value === 'all') return props.results;
  return props.results.filter((r) => r.type === filter.value);
});

const httpCount = computed(
  () => props.results.filter((r) => r.type === 'http').length,
);
const socketCount = computed(
  () => props.results.filter((r) => r.type === 'socket').length,
);

function select(result: DebugResult) {
  const newSelection = props.selectedResult?.id === result.id ? null : result;
  emit('select', newSelection);
}
</script>

<template>
  <DebugPanelLayout>
    <DebugPanelHeader>
      <DebugPanelHeaderTitle label="Request Log" />
      <DebugPanelHeaderMenu
        :filter="filter"
        :all-count="results.length"
        :http-count="httpCount"
        :socket-count="socketCount"
        @update:filter="filter = $event"
        @clear="$emit('clear')"
      />
    </DebugPanelHeader>
    <DebugPanelResults
      v-if="filteredResults.length"
      :results="filteredResults"
      :selected-result-id="selectedResult?.id!"
      @select="select"
    />
    <DebugPanelEmptyState v-else />
  </DebugPanelLayout>
</template>
