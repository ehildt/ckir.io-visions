<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <label
    class="text-xs font-medium text-fg-secondary font-mono uppercase tracking-wider"
  >
    {{ text }}
  </label>
</template>
