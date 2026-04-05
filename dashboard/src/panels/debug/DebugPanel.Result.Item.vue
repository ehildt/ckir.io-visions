<script lang="ts" setup>
import type { DebugResult } from '../../types/debug.model';
import { getStatusColors } from '../../utils/colors/status-colors.helper';
import DebugPanelResultItemInfoRow from './DebugPanel.Result.Item.Info.Row.vue';
import DebugPanelResultItemStatusIndicator from './DebugPanel.Result.Item.Status.Indicator.vue';
import DebugPanelResultItemTag from './DebugPanel.Result.Item.Tag.vue';

defineProps<{
  result: DebugResult;
}>();
</script>

<template>
  <div
    class="px-4 py-3 flex items-center gap-3"
    :class="getStatusColors(result.status).bg"
  >
    <DebugPanelResultItemStatusIndicator :status="result.status" />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <DebugPanelResultItemTag variant="type" :value="result.type" />
        <DebugPanelResultItemTag
          v-if="result.direction"
          variant="direction"
          :value="result.direction"
        />
        <DebugPanelResultItemTag variant="status" :value="result.status" />
        <DebugPanelResultItemInfoRow
          :method="result.method"
          :type="result.type"
          :event="result.event"
          :room-id="result.roomId"
          :model="result.model"
          :request-id="result.requestId"
          :endpoint="result.endpoint"
        />
      </div>
    </div>
  </div>
</template>
