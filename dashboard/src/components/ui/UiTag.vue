<script setup lang="ts">
type TagColor = 'primary' | 'secondary' | 'tertiary' | 'rest' | 'mcp' | 'debug';

const props = defineProps<{
  label: string;
  color: TagColor;
}>();

const colorClasses: Record<TagColor, string> = {
  primary: 'border-tab-rest/70 text-tab-rest',
  secondary: 'border-tab-mcp/70 text-tab-mcp',
  tertiary: 'border-tab-debug/70 text-tab-debug',
  rest: 'border-tab-rest/70 text-tab-rest',
  mcp: 'border-tab-mcp/70 text-tab-mcp',
  debug: 'border-tab-debug/70 text-tab-debug',
};
</script>

<template>
  <span
    class="text-xs font-bold px-2 py-0.5 border"
    :class="colorClasses[props.color]"
  >
    {{ props.label }}
  </span>
</template>
