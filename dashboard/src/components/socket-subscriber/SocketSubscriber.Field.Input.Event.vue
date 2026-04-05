<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder: string;
  blinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'blink'): void;
}>();
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    :class="[
      'w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary placeholder-text-fg-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all font-mono',
      blinking ? 'animate-pulse ring-2 ring-accent-primary' : '',
    ]"
    @input="
      emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>
