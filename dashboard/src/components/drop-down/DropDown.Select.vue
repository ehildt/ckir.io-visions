<script setup lang="ts">
defineProps<{
  selected: string | boolean | number;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selected', value: string): void;
}>();

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:selected', target.value);
}
</script>

<template>
  <select
    :value="selected"
    :disabled="disabled"
    class="flex-1 px-3 py-2 bg-secondary border border-divider rounded-none text-sm text-fg-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-mono appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    @change="handleChange"
  >
    <option v-if="placeholder" value="" disabled>
      {{ placeholder }}
    </option>
    <option v-for="option in options" :key="option" :value="option">
      {{ option }}
    </option>
  </select>
</template>
