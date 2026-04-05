<script lang="ts" setup>
import BaseButton from '../ui/BaseButton.vue';

defineProps<{ label: string }>();
defineEmits<{ (e: 'click'): void }>();
</script>

<template>
  <BaseButton :label="label" variant="debug" @click="$emit('click')" />
</template>
