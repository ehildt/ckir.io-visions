<script lang="ts" setup>
import ClearButton from '../../components/buttons/ClearButton.vue';
import FilterButton from '../../components/buttons/FilterButton.vue';

defineProps<{
  filter: 'all' | 'http' | 'socket';
  allCount: number;
  httpCount: number;
  socketCount: number;
}>();

defineEmits<{
  (e: 'update:filter', value: 'all' | 'http' | 'socket'): void;
  (e: 'clear'): void;
}>();
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-1">
      <FilterButton
        label="ALL"
        :count="allCount"
        :active="filter === 'all'"
        color="accent-primary"
        @click="$emit('update:filter', 'all')"
      />
      <FilterButton
        label="HTTP"
        :count="httpCount"
        :active="filter === 'http'"
        color="info"
        @click="$emit('update:filter', 'http')"
      />
      <FilterButton
        label="SOCKET"
        :count="socketCount"
        :active="filter === 'socket'"
        color="warning"
        @click="$emit('update:filter', 'socket')"
      />
    </div>
    <ClearButton label="CLR" @click="$emit('clear')" />
  </div>
</template>
