<script setup lang="ts">
import FileUploadLabel from './FileUpload.Label.vue';

defineOptions({
  components: {
    FileUploadLabel,
  },
});

defineProps<{
  label?: string;
}>();
</script>

<template>
  <div class="space-y-1.5">
    <FileUploadLabel v-if="label" :text="label" />
    <slot />
  </div>
</template>
