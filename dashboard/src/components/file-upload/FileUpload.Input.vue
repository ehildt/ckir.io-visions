<script setup lang="ts">
import { ref } from 'vue';

import FileUploadInputButton from './FileUpload.Input.Button.vue';

defineProps<{
  disabled?: boolean;
  blinking?: boolean;
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

function triggerFileInput() {
  fileInputRef.value?.click();
}

defineExpose({
  fileInputRef,
});
</script>

<template>
  <div class="relative h-9.5 cursor-pointer w-full" @click="triggerFileInput">
    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      :disabled="disabled"
      @change="handleChange"
    />
    <!-- Use the existing button component -->
    <FileUploadInputButton :disabled="disabled" :blinking="blinking" />
  </div>
</template>

<style>
/* Hide file input completely */
.hidden {
  display: none !important;
}
</style>
