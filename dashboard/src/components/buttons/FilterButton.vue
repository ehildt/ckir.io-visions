<script lang="ts" setup>
defineProps<{
  label: string;
  count: number;
  active: boolean;
  color: 'brand' | 'info' | 'warning';
}>();

defineEmits<{ (e: 'click'): void }>();

const activeClasses = {
  brand: 'bg-brand text-fg-inverse',
  info: 'bg-info text-fg-inverse',
  warning: 'bg-warning text-fg-inverse',
} as const;

const inactiveClasses = {
  brand: 'text-fg-muted hover:text-fg-secondary',
  info: 'text-fg-muted hover:text-info',
  warning: 'text-fg-muted hover:text-warning',
} as const;
</script>

// ! use classes
<template>
  <button
    class="px-2 py-0.5 text-xs font-mono transition-colors"
    :class="active ? activeClasses : inactiveClasses"
    @click="$emit('click')"
  >
    {{ label }} [{{ count }}]
  </button>
</template>
