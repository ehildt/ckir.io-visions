<script setup lang="ts">
import ClearButton from '../buttons/ClearButton.vue';

defineProps<{
  file: File;
}>();

const emit = defineEmits<{
  (e: 'remove'): void;
}>();
</script>

<template>
  <div
    class="flex items-center gap-2 p-2 bg-tertiary border border-divider rounded text-xs font-mono w-full"
  >
    <span class="text-fg-secondary w-full truncate">{{ file.name }}</span>
    <ClearButton label="[CRL]" @click="emit('remove')" />
  </div>
</template>
