<script setup lang="ts">
import { computed } from 'vue';

import type { ActiveTab } from '../../stores/app';

const props = defineProps<{
  label: string;
  tab: ActiveTab;
  activeTab: ActiveTab;
  count?: number;
  activeClasses: string;
  hoverClasses: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const isActive = computed(() => props.tab === props.activeTab);
const showCount = computed(() => (props.count ?? 0) > 0 && !isActive.value);
</script>

<template>
  <button
    class="px-4 py-2 text-xs font-mono transition-all duration-300 relative overflow-visible"
    :class="[
      isActive
        ? `text-fg-inverse font-bold ${activeClasses}`
        : `text-fg-secondary ${hoverClasses} hover:bg-secondary`,
    ]"
    @click="emit('click')"
  >
    {{ label }}
    <span
      v-if="showCount"
      class="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-[10px] bg-accent-active text-fg-primary font-bold rounded-full z-50 border border-fg-primary/20 shadow-lg animate-pulse"
    >
      {{ count! > 99 ? '99+' : count }}
    </span>
  </button>
</template>
