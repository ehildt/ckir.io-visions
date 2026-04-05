<script setup lang="ts">
import RefreshButton from '../buttons/RefreshButton.vue';
import DropDown from '../drop-down/DropDown.vue';

defineProps<{
  modelValue: string;
  models: string[];
  modelsLoading: boolean;
  placeholder?: string;
  blinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'refresh-models'): void;
}>();
</script>

<template>
  <DropDown
    label="Model"
    :selected="modelValue"
    :options="models"
    :placeholder="
      modelsLoading ? 'Loading...' : models.length ? 'Select...' : 'No models'
    "
    :disabled="modelsLoading || !models.length"
    :blinking="blinking"
    @update:selected="(value: string) => emit('update:modelValue', value)"
  >
    <RefreshButton :disabled="modelsLoading" @click="emit('refresh-models')" />
  </DropDown>
</template>
