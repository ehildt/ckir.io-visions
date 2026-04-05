<script lang="ts" setup>
import { Check, X } from 'lucide-vue-next';

import { getStatusColors } from '../../utils/colors/status-colors.helper';

defineProps<{
  status: 'success' | 'error';
}>();
</script>

<template>
  <div
    class="w-6 h-6 flex items-center justify-center shrink-0"
    :class="getStatusColors(status).indicatorBg"
  >
    <Check
      v-if="status === 'success'"
      class="w-4 h-4"
      :class="getStatusColors(status).indicatorText"
    />
    <X v-else class="w-4 h-4" :class="getStatusColors(status).indicatorText" />
  </div>
</template>
