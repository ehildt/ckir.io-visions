<script setup lang="ts">
import { Activity, HeartPulse } from 'lucide-vue-next';
import { computed } from 'vue';

import useHealthLive from '../../api/queries/use-health-live.query';
import useHealthReady from '../../api/queries/use-health-ready.query';
import DebugPanelHeaderTitle from './DebugPanel.Header.Title.vue';
import DebugPanelHeader from './DebugPanel.Header.vue';
import DebugPanelLayout from './DebugPanel.Layout.vue';

const {
  data: readyData,
  isLoading: readyLoading,
  isError: readyError,
} = useHealthReady();
const {
  data: liveData,
  isLoading: liveLoading,
  isError: liveError,
} = useHealthLive();

const readyChecks = computed(() => {
  if (!readyData.value) return [];
  const info = readyData.value.info || {};
  const details = readyData.value.details || {};
  return Object.entries(info).map(([key, val]) => ({
    key,
    status: (details[key] as any)?.status ?? (val as any)?.status ?? 'unknown',
  }));
});

const liveHealthy = computed(() => {
  if (!liveData.value) return false;
  return liveData.value.status === 'ok';
});
</script>

<template>
  <DebugPanelLayout>
    <DebugPanelHeader>
      <DebugPanelHeaderTitle label="System Health" />
    </DebugPanelHeader>

    <div class="p-4 space-y-3">
      <!-- Ready -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <HeartPulse class="w-3.5 h-3.5 text-fg-muted" />
          <span
            class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted"
          >
            Ready
          </span>
        </div>
        <div v-if="readyLoading" class="text-xs font-mono text-fg-muted">
          Checking...
        </div>
        <div v-else-if="readyError" class="text-xs font-mono text-status-error">
          Error
        </div>
        <div v-else class="space-y-1 pl-1">
          <div
            v-for="check in readyChecks"
            :key="check.key"
            class="flex items-center gap-2"
          >
            <div
              class="status-dot"
              :class="
                check.status === 'up'
                  ? 'status-dot-success'
                  : 'status-dot-error'
              "
            />
            <span class="text-[10px] font-mono text-fg-secondary">
              {{ check.key }}
            </span>
            <span
              class="text-[10px] font-mono ml-auto"
              :class="
                check.status === 'up'
                  ? 'text-status-success'
                  : 'text-status-error'
              "
            >
              {{ check.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Live -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <Activity class="w-3.5 h-3.5 text-fg-muted" />
          <span
            class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted"
          >
            Live
          </span>
        </div>
        <div v-if="liveLoading" class="text-xs font-mono text-fg-muted">
          Checking...
        </div>
        <div v-else-if="liveError" class="text-xs font-mono text-status-error">
          Error
        </div>
        <div v-else class="flex items-center gap-2 pl-1">
          <div
            class="status-dot"
            :class="liveHealthy ? 'status-dot-success' : 'status-dot-error'"
          />
          <span class="text-[10px] font-mono text-fg-secondary"> service </span>
          <span
            class="text-[10px] font-mono ml-auto"
            :class="liveHealthy ? 'text-status-success' : 'text-status-error'"
          >
            {{ liveHealthy ? 'up' : 'down' }}
          </span>
        </div>
      </div>
    </div>
  </DebugPanelLayout>
</template>
