<script setup lang="ts">
import type { ConnectionState } from '../../stores/socket';
import { getConnectionStateColors } from '../../utils/colors/status-colors.helper';

defineProps<{
  connectionState: ConnectionState;
  socketId?: string | null;
}>();
</script>

<template>
  <footer
    class="fixed bottom-0 left-0 right-0 border-t border-divider bg-secondary"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div
        class="flex items-center justify-between text-xs text-fg-muted font-mono"
      >
        <div class="flex items-center gap-3">
          <span class="text-tab-rest">ckir.io/visions</span>
          <span class="text-border">::</span>
          <span>v1.2.0</span>
          <span class="text-border">::</span>
          <span :class="getConnectionStateColors(connectionState).text">
            {{ connectionState.toUpperCase() }}
          </span>
          <span v-if="socketId" class="text-border">::</span>
          <span v-if="socketId" class="text-fg-secondary text-[10px]">
            {{ socketId }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-fg-muted">endpoints:</span>
          <span class="text-accent-primary">/api/v1/vision</span>
          <span class="text-border">,</span>
          <span class="text-accent-secondary">/api/v1/mcp</span>
        </div>
      </div>
    </div>
  </footer>
</template>
