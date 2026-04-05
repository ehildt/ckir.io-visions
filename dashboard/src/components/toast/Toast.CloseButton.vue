<script setup lang="ts">
import type { ToastTheme, ToastType } from 'vue3-toastify';

interface Props {
  theme: ToastTheme;
  type: ToastType;
  path?: string;
}

defineProps<Props>();
</script>

<template>
  <button
    class="text-xs font-mono px-1 py-0.5 text-fg-secondary hover:text-fg-primary transition-colors"
    aria-label="Close"
  >
    {{ path || '[CLS]' }}
  </button>
</template>
