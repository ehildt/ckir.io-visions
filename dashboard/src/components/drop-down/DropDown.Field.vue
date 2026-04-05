<script setup lang="ts">
import FormLabel from '../ui/FormLabel.vue';

defineProps<{
  label: string;
  disabled?: boolean;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <FormLabel v-if="label">{{ label }}</FormLabel>
    <div class="flex gap-2">
      <slot />
      <slot name="action" />
    </div>
  </div>
</template>
