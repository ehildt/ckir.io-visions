<script setup lang="ts">
import { InputSelect } from '../ui';

defineProps<{
  selected: string | boolean | number;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  blinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selected', value: string): void;
}>();

function handleChange(value: string) {
  emit('update:selected', value);
}
</script>

<template>
  <InputSelect
    :model-value="String(selected)"
    :options="options"
    :placeholder="placeholder"
    :disabled="disabled"
    :blinking="blinking"
    @update:model-value="handleChange"
  />
</template>
