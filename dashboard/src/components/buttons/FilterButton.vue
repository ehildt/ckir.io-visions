<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue';

defineProps<{
  label: string;
  count: number;
  active: boolean;
  color: 'accent-primary' | 'info' | 'warning';
}>();

defineEmits<{ (e: 'click'): void }>();
</script>

<template>
  <BaseButton
    :label="label"
    :count="count"
    variant="filter"
    :active="active"
    :color="color"
    @click="$emit('click')"
  />
</template>
