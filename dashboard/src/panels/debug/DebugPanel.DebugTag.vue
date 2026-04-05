<script setup lang="ts">
import { getTagColorClasses } from '../../utils/colors/tag-colors.helper';

defineProps<{
  category: 'type' | 'direction' | 'status';
  value: string;
}>();
</script>

<template>
  <span
    class="text-[10px] px-1.5 py-0.5 font-mono uppercase border"
    :class="[
      getTagColorClasses(category, value).border,
      getTagColorClasses(category, value).text,
      getTagColorClasses(category, value).bg,
    ]"
  >
    {{ value }}
  </span>
</template>
