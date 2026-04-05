<script setup lang="ts">
import DropDown from '../drop-down/DropDown.vue';

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const options = [
  '4096',
  '8192',
  '16384',
  '32768',
  '65536',
  '131072',
  '262144',
  '524288',
  '1048576',
];
</script>

<template>
  <DropDown
    label="NumCtx"
    :selected="modelValue || '16384'"
    :options="options"
    @update:selected="(value: string) => emit('update:modelValue', value)"
  />
</template>
