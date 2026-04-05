<script setup lang="ts">
import RefreshButton from '../buttons/RefreshButton.vue';
import { FormLabel, InputGroup, InputText } from '../ui';

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'refresh'): void;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <FormLabel>Request ID</FormLabel>
    <InputGroup>
      <InputText
        :model-value="modelValue"
        class="flex-1"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <RefreshButton @click="emit('refresh')" />
    </InputGroup>
  </div>
</template>
