<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>

<template>
  <label
    class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
  >
    <slot>{{ text }}</slot>
  </label>
</template>
