<script setup lang="ts">
defineProps<{
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    :disabled="disabled"
    class="px-2 py-2 bg-tertiary border border-divider rounded-none text-sm text-fg-secondary hover:text-fg-primary disabled:opacity-50 transition-all font-mono"
    title="Refresh"
    @click="$emit('click')"
  >
    ↻
  </button>
</template>
