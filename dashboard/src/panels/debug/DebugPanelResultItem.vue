<script lang="ts" setup>
import type { DebugResult } from './debug-result.model';
import DebugPanelResultItemInfoRow from './DebugPanelResultItem.InfoRow.vue';
import DebugPanelResultItemMetadataRow from './DebugPanelResultItem.MetadataRow.vue';
import DebugPanelResultItemStatusIndicator from './DebugPanelResultItem.StatusIndicator.vue';
import DebugPanelResultItemTag from './DebugPanelResultItem.Tag.vue';
import { useDebugColors } from './use-debug-colors';

defineProps<{
  result: DebugResult;
}>();

const { getStatusColors } = useDebugColors();
</script>

<template>
  <div
    class="px-4 py-3 flex items-center gap-3"
    :class="getStatusColors(result.status).bg"
  >
    <DebugPanelResultItemStatusIndicator :status="result.status" />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <DebugPanelResultItemTag variant="type" :value="result.type" />
        <DebugPanelResultItemTag
          v-if="result.direction"
          variant="direction"
          :value="result.direction"
        />
        <DebugPanelResultItemTag variant="status" :value="result.status" />
        <DebugPanelResultItemInfoRow
          :method="result.method"
          :request-id="result.requestId"
          :endpoint="result.endpoint"
        />
      </div>
      <div class="flex items-center gap-3 text-xs font-mono text-fg-muted">
        <DebugPanelResultItemMetadataRow
          :timestamp="result.timestamp"
          :response-time="result.responseTime"
          :status-code="result.statusCode"
        />
      </div>
    </div>
  </div>
</template>
