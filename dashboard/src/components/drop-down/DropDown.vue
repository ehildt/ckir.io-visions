<script setup lang="ts">
import DropDownField from './DropDown.Field.vue';
import DropDownSelect from './DropDown.Select.vue';

defineProps<{
  selected: string | boolean | number;
  options: string[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selected', value: string): void;
}>();

function handleSelectionChange(value: string) {
  emit('update:selected', value);
}
</script>

<template>
  <DropDownField v-if="label" :label="label" :disabled="disabled">
    <DropDownSelect
      :selected="selected"
      :options="options"
      :placeholder="placeholder"
      :disabled="disabled"
      @update:selected="handleSelectionChange"
    />
    <slot />
  </DropDownField>
  <DropDownSelect
    v-else
    :selected="selected"
    :options="options"
    :placeholder="placeholder"
    :disabled="disabled"
    @update:selected="handleSelectionChange"
  />
</template>
