<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

import { useDebouncedLoading } from '../../composables/use-debounced-loading';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps<{
  disabled: boolean;
  loading: boolean;
  blinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
}>();

const { showLoading } = useDebouncedLoading(() => props.loading, 500);
</script>

<template>
  <BaseButton
    variant="rest"
    :disabled="disabled"
    @click="emit('click')"
    @mouseenter="emit('mouseenter')"
    @mouseleave="emit('mouseleave')"
  >
    <span v-if="showLoading" class="flex items-center justify-center gap-2">
      <Loader2 class="w-4 h-4 animate-spin" />
      Analyzing...
    </span>
    <span v-else>Analyze</span>
  </BaseButton>
</template>
