<script setup lang="ts">
import { computed } from 'vue';

import { FormLabel, InputSelect } from '../ui';

const props = defineProps<{
  modelValue: string;
  options?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const defaultOptions = ['initialize', 'tools/list', 'visions.analyze'];

const options = computed(() => props.options ?? defaultOptions);
</script>

<template>
  <div class="space-y-1.5">
    <FormLabel>Method</FormLabel>
    <InputSelect
      :model-value="modelValue"
      :options="options"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
