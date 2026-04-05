<script setup lang="ts">
import FormLabel from '../ui/FormLabel.vue';

defineProps<{
  text?: string;
}>();
</script>

<template>
  <FormLabel>{{ text }}</FormLabel>
</template>
