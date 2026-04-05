<script setup lang="ts">
import FileUploadFilesFile from './FileUpload.Files.File.vue';

defineOptions({
  components: {
    FileUploadFilesFile,
  },
});

defineProps<{
  files: File[];
}>();

const emit = defineEmits<{
  (e: 'remove', index: number): void;
}>();

const handleRemove = (index: number) => {
  emit('remove', index);
};
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <FileUploadFilesFile
      v-for="(file, i) in files"
      :key="i"
      :file="file"
      @remove="handleRemove(i)"
    />
    <slot />
  </div>
</template>
