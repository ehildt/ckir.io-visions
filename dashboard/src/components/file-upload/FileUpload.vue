<script setup lang="ts">
import { ref } from 'vue';

import FileUploadField from './FileUpload.Field.vue';
import FileUploadFiles from './FileUpload.Files.vue';
import FileUploadInput from './FileUpload.Input.vue';

defineProps<{
  disabled?: boolean;
  blinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', files: File[]): void;
}>();

const files = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

function handleFileChange(newFiles: File[]) {
  files.value = newFiles;
  emit('change', newFiles);
}

function handleRemoveFile(index: number) {
  files.value.splice(index, 1);
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.files = null;
  }
  emit('change', files.value);
}
</script>

<template>
  <FileUploadField label="Images">
    <FileUploadInput
      v-if="!files.length"
      ref="fileInputRef"
      :disabled="disabled"
      :blinking="blinking"
      @change="handleFileChange"
    />
    <FileUploadFiles
      v-if="files.length"
      :files="files"
      @remove="handleRemoveFile"
    />
  </FileUploadField>
</template>
