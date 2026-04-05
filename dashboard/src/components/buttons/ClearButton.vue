<script lang="ts" setup>
defineProps<{ label: string }>();
defineEmits<{ (e: 'click'): void }>();
</script>

<template>
  <button
    class="px-2 py-0.5 text-xs font-mono text-error hover:bg-error hover:text-fg-inverse transition-colors"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>
