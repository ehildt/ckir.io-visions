<script setup lang="ts">
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'rest'
  | 'mcp'
  | 'debug'
  | 'preprocessing';

const props = defineProps<{
  label: string;
  variant: ButtonVariant;
  title?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const baseClasses: Record<ButtonVariant, string> = {
  primary: 'border-tab-rest/30 text-tab-rest/60',
  secondary: 'border-tab-mcp/30 text-tab-mcp/60',
  tertiary: 'border-tab-debug/30 text-tab-debug/60',
  rest: 'border-tab-rest/30 text-tab-rest/60',
  mcp: 'border-tab-mcp/30 text-tab-mcp/60',
  debug: 'border-tab-debug/30 text-tab-debug/60',
  preprocessing: 'border-tab-preprocessing/30 text-tab-preprocessing/60',
};

const hoverClasses: Record<ButtonVariant, string> = {
  primary:
    'hover:border-tab-rest hover:text-tab-rest hover:shadow-[0_0_4px_var(--color-tab-rest)]',
  secondary:
    'hover:border-tab-mcp hover:text-tab-mcp hover:shadow-[0_0_4px_var(--color-tab-mcp)]',
  tertiary:
    'hover:border-tab-debug hover:text-tab-debug hover:shadow-[0_0_4px_var(--color-tab-debug)]',
  rest: 'hover:border-tab-rest hover:text-tab-rest hover:shadow-[0_0_4px_var(--color-tab-rest)]',
  mcp: 'hover:border-tab-mcp hover:text-tab-mcp hover:shadow-[0_0_4px_var(--color-tab-mcp)]',
  debug:
    'hover:border-tab-debug hover:text-tab-debug hover:shadow-[0_0_4px_var(--color-tab-debug)]',
  preprocessing:
    'hover:border-tab-preprocessing hover:text-tab-preprocessing hover:shadow-[0_0_4px_var(--color-tab-preprocessing)]',
};

function getClasses(): string {
  const base = baseClasses[props.variant];
  if (props.disabled) {
    return base + ' opacity-40 cursor-default';
  }
  return base + ' ' + hoverClasses[props.variant] + ' cursor-pointer';
}
</script>

<template>
  <button
    class="text-xs font-bold px-2 py-0.5 border transition-all duration-300"
    :class="getClasses()"
    :disabled="disabled"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>
