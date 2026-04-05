<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    :disabled="disabled"
    class="px-2 py-2 h-9.5 bg-tertiary border border-divider rounded-none text-sm text-fg-secondary hover:text-fg-primary disabled:opacity-50 transition-all font-mono flex items-center justify-center"
    @click="emit('click')"
  >
    <RefreshCw class="w-4 h-4" />
  </button>
</template>
