<script setup lang="ts">
import DropDown from '../drop-down/DropDown.vue';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <DropDown
    label="Stream"
    :selected="String(modelValue)"
    :options="['false', 'true']"
    @update:selected="
      (value: string) => emit('update:modelValue', value === 'true')
    "
  />
</template>
