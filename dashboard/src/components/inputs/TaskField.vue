<script setup lang="ts">
import DropDown from '../drop-down/DropDown.vue';

defineProps<{
  modelValue: string;
  options?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <DropDown
    label="Task"
    :selected="modelValue"
    :options="options ?? ['describe', 'compare', 'ocr']"
    @update:selected="(value: string) => emit('update:modelValue', value)"
  />
</template>
