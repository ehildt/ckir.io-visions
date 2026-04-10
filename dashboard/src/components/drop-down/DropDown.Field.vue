<script setup lang="ts">
import DropDownLabel from './DropDown.Label.vue';

defineProps<{
  label: string;
  disabled?: boolean;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <DropDownLabel v-if="label" :text="label" />
    <div class="flex gap-2">
      <slot />
      <slot name="action" />
    </div>
  </div>
</template>
