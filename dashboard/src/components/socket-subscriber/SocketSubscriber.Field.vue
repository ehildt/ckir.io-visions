<script setup lang="ts">
import FormLabel from '../ui/FormLabel.vue';

defineProps<{
  label?: string;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <FormLabel v-if="label">{{ label }}</FormLabel>
    <slot />
  </div>
</template>
