<script setup lang="ts">
defineProps<{
  disabled: boolean;
  blinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
}>();
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'px-4 py-2 h-9.5 font-bold text-sm rounded-none transition-all duration-250 font-mono border border-accent-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed',
      blinking
        ? 'bg-primary text-accent-primary animate-pulse ring-2 ring-accent-primary'
        : 'bg-accent-primary text-fg-inverse hover:bg-primary hover:text-accent-primary',
    ]"
    @click="emit('click')"
    @mouseenter="emit('mouseenter')"
    @mouseleave="emit('mouseleave')"
  >
    Subscribe
  </button>
</template>
