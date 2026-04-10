<script setup lang="ts">
defineProps<{
  disabled?: boolean;
}>();
</script>

<template>
  <span
    v-if="disabled"
    class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-mono text-fg-muted pointer-events-none"
  >
    Browse
  </span>
</template>
