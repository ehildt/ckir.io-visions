<script setup lang="ts">
import { FormLabel, InputTextArea } from '../ui';

defineProps<{
  modelValue: string;
  label: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <FormLabel>{{ label }}</FormLabel>
    <InputTextArea
      :model-value="modelValue"
      :placeholder="placeholder ?? label"
      :rows="3"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
