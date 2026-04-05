<script lang="ts" setup>
import { useDebugColors } from './use-debug-colors';

const props = defineProps<{
  variant: 'type' | 'direction' | 'status';
  value: string;
}>();

const { getTypeColors, getDirectionColors, getStatusColors } = useDebugColors();

const getColors = () => {
  if (props.variant === 'type') return getTypeColors(props.value);
  if (props.variant === 'direction') return getDirectionColors(props.value);
  return getStatusColors(props.value as 'success' | 'error');
};
</script>

<template>
  <span
    class="text-[10px] px-1.5 py-0.5 font-mono uppercase"
    :class="[getColors().border, getColors().text, getColors().bg]"
  >
    {{ value }}
  </span>
</template>
