<script setup lang="ts">
import {
  getDetailFieldColors,
  getValueTypeColor,
  getValueTypeGradient,
} from '../../utils/colors/detail-field-colors.helper';

function formatLabel(field: string): string {
  switch (field) {
    case 'requestId':
      return 'Request ID';
    case 'roomId':
      return 'Room ID';
    case 'numCtx':
      return 'Num Ctx';
    case 'sessionId':
      return 'Session';
    case 'preprocessing':
      return 'Preprocessing';
    case 'statusCode':
      return 'Status';
    case 'responseTime':
      return 'Response Time';
    case 'errorMessage':
      return 'Error Message';
    default:
      return field.charAt(0).toUpperCase() + field.slice(1);
  }
}

defineProps<{
  field: string;
  value: unknown;
}>();
</script>

<template>
  <div
    v-if="value !== undefined && value !== null && value !== ''"
    class="flex items-center bg-secondary rounded-none overflow-hidden relative border"
    :class="getDetailFieldColors(field).border"
  >
    <div
      class="absolute inset-0 bg-gradient-to-r"
      :class="
        getValueTypeGradient(value) ?? getDetailFieldColors(field).gradient
      "
    />
    <span
      class="text-[10px] font-mono font-bold uppercase px-2 py-1 relative z-10"
      :class="getDetailFieldColors(field).text"
    >
      {{ formatLabel(field) }}
    </span>
    <span
      class="text-[10px] font-mono px-2 py-1 relative z-10"
      :class="getValueTypeColor(value) ?? 'text-fg-primary'"
    >
      {{ value }}
    </span>
  </div>
</template>
