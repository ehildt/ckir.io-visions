<script setup lang="ts">
import FormLabel from './FormLabel.vue';

defineProps<{
  label?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <FormLabel v-if="label"
      ><slot name="label">{{ label }}</slot></FormLabel
    >
    <slot name="content">
      <div class="flex gap-2 items-center">
        <slot />
        <slot name="action" />
      </div>
    </slot>
  </div>
</template>
