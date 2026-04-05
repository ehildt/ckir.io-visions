<script setup lang="ts">
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'rest'
  | 'mcp'
  | 'debug'
  | 'preprocessing'
  | 'danger'
  | 'filter'
  | 'icon';

const props = defineProps<{
  label?: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  active?: boolean;
  count?: number;
  color?: 'accent-primary' | 'info' | 'warning';
  icon?: import('vue').Component;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'px-2 py-0.5 text-xs font-bold border transition-all duration-300 border-tab-rest/30 text-tab-rest/60 hover:border-tab-rest hover:text-tab-rest hover:shadow-[0_0_4px_var(--color-tab-rest)]',
  secondary:
    'px-2 py-0.5 text-xs font-bold border transition-all duration-300 border-tab-mcp/30 text-tab-mcp/60 hover:border-tab-mcp hover:text-tab-mcp hover:shadow-[0_0_4px_var(--color-tab-mcp)]',
  tertiary:
    'px-2 py-0.5 text-xs font-bold border transition-all duration-300 border-tab-debug/30 text-tab-debug/60 hover:border-tab-debug hover:text-tab-debug hover:shadow-[0_0_4px_var(--color-tab-debug)]',
  rest: 'w-full px-4 py-2.5 bg-tab-rest text-fg-inverse hover:brightness-90 font-bold text-sm rounded-none transition-all duration-200 font-mono border border-tab-rest disabled:opacity-50 disabled:cursor-not-allowed',
  mcp: 'w-full px-4 py-2.5 bg-tab-mcp text-fg-inverse hover:brightness-90 font-bold text-sm rounded-none transition-all duration-200 font-mono border border-tab-mcp disabled:opacity-50 disabled:cursor-not-allowed',
  debug:
    'px-2 py-0.5 text-xs font-mono border border-tab-debug/70 text-tab-debug hover:border-tab-debug hover:text-tab-debug hover:shadow-[0_0_4px_var(--color-tab-debug)] transition-all duration-300',
  preprocessing:
    'px-2 py-0.5 text-xs font-bold border transition-all duration-300 border-tab-preprocessing/30 text-tab-preprocessing/60 hover:border-tab-preprocessing hover:text-tab-preprocessing hover:shadow-[0_0_4px_var(--color-tab-preprocessing)]',
  danger:
    'px-2 py-0.5 text-xs font-bold border transition-all duration-300 border-status-error/30 text-status-error/60 hover:border-status-error hover:text-status-error hover:shadow-[0_0_4px_var(--color-status-error)]',
  filter:
    'px-2 py-0.5 text-xs font-mono border transition-all duration-300 relative',
  icon: 'px-2 py-2 h-9.5 bg-tertiary border border-divider rounded-none text-sm text-fg-secondary hover:text-fg-primary disabled:opacity-50 transition-all font-mono flex items-center justify-center',
};

const activeClasses: Record<string, string> = {
  'accent-primary':
    'bg-accent-primary text-fg-inverse border-accent-primary shadow-[0_0_6px_var(--color-accent-primary)] z-10',
  info: 'bg-status-info text-fg-inverse border-status-info shadow-[0_0_6px_var(--color-status-info)] z-10',
  warning:
    'bg-status-warning text-fg-inverse border-status-warning shadow-[0_0_6px_var(--color-status-warning)] z-10',
};

const inactiveClasses: Record<string, string> = {
  'accent-primary':
    'border-accent-primary/40 text-accent-primary/60 hover:border-accent-primary/80 hover:text-accent-primary hover:shadow-[0_0_4px_var(--color-accent-primary)] hover:z-10',
  info: 'border-status-info/40 text-status-info/60 hover:border-status-info/80 hover:text-status-info hover:shadow-[0_0_4px_var(--color-status-info)] hover:z-10',
  warning:
    'border-status-warning/40 text-status-warning/60 hover:border-status-warning/80 hover:text-status-warning hover:shadow-[0_0_4px_var(--color-status-warning)] hover:z-10',
};

function getClasses(): string {
  if (props.variant === 'filter' && props.active !== undefined && props.color) {
    return `${variantClasses.filter} ${props.active ? activeClasses[props.color] : inactiveClasses[props.color]}`;
  }
  return variantClasses[props.variant || 'primary'];
}
</script>

<template>
  <button
    class="disabled:opacity-50 disabled:cursor-default"
    :class="getClasses()"
    :disabled="disabled"
    @click="emit('click')"
  >
    <span v-if="icon" class="flex items-center gap-1">
      <component
        :is="icon"
        class="w-4 h-4"
        :class="icon !== undefined ? '' : ''"
      />
      <span v-if="label">{{ label }}</span>
    </span>
    <span v-else-if="label"
      >{{ label
      }}<template v-if="count !== undefined">[{{ count }}]</template></span
    >
    <span v-else><slot /></span>
  </button>
</template>
