<script setup lang="ts">
defineProps<{
  label: string;
  color: 'accent-primary' | 'info' | 'warning' | 'error' | 'success';
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    class="px-2 py-0.5 text-xs font-mono transition-all active:scale-95 active:opacity-70 hover:text-fg-primary"
    :class="{
      'text-status-error hover:bg-status-error': color === 'error',
      'text-status-info hover:bg-status-info': color === 'info',
      'text-status-warning hover:bg-status-warning': color === 'warning',
      'text-status-success hover:bg-status-success': color === 'success',
      'text-accent-primary hover:bg-accent-primary': color === 'accent-primary',
    }"
    @click="$emit('click')"
  >
    [{{ label }}]
  </button>
</template>
