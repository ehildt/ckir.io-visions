<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-[var(--color-accent-active)] focus:ring-1 focus:ring-[var(--color-accent-active)] transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
    @input="handleInput"
  />
</template>
