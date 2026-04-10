<script setup lang="ts">
import { ref } from 'vue';

import FileUploadInputButton from './FileUpload.Input.Button.vue';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', files: File[]): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

function handleChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const newFiles = Array.from(input.files || []);
  emit('change', newFiles);
}

defineExpose({
  fileInputRef,
});
</script>

<template>
  <div class="relative">
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="w-full px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-brand file:text-black file:cursor-pointer"
      :disabled="$props.disabled"
      @change="handleChange"
    />
    <FileUploadInputButton :disabled="$props.disabled" />
  </div>
</template>
