<script setup lang="ts">
import { ChevronRight, Link2 } from 'lucide-vue-next';
import { computed, ref } from 'vue';

import type { DebugResult } from '../../types/debug.model';
import {
  getValueTypeColor,
  getValueTypeGradient,
} from '../../utils/colors/detail-field-colors.helper';
import { getMethodTabColor } from '../../utils/colors/method-colors.helper';
import { formatBody } from '../../utils/formatting.helper';
import DebugTag from './DebugPanel.DebugTag.vue';
import { parseUrl } from './DebugPanel.Details.helper';
import DetailTag from './DebugPanel.DetailTag.vue';

const props = defineProps<{
  result: DebugResult | null;
}>();

const parsedUrl = computed(() => {
  const parsed = parseUrl(props.result?.endpoint ?? '');
  const knownKeys = new Set([
    'requestId',
    'numCtx',
    'model',
    'roomId',
    'sessionId',
    'event',
    'stream',
    'preprocessing',
  ]);
  return {
    path: parsed.path,
    params: parsed.params.filter((p) => !knownKeys.has(p.key)),
  };
});

function resolveParamColor(value: string): string {
  return getValueTypeColor(value) ?? 'text-tab-mcp';
}

const showPrompt = ref(false);
const showBody = ref(false);
const showResponse = ref(false);
const showHeaders = ref(false);
</script>

<template>
  <div class="bg-elevated border border-divider panel-glow">
    <!-- Header -->
    <div
      class="px-4 py-3 bg-secondary border-b border-divider flex items-center justify-between"
    >
      <div class="flex items-center gap-2 font-mono">
        <ChevronRight class="w-4 h-4 text-accent-primary" />
        <span class="text-xs text-accent-primary uppercase tracking-wider"
          >Request Details</span
        >
      </div>
    </div>

    <div v-if="result" :key="result.id" class="p-4 space-y-6">
      <!-- Identity -->
      <div
        class="flex flex-wrap items-center gap-2 pb-3 border-b border-divider"
      >
        <DebugTag v-if="result.type" category="type" :value="result.type" />
        <DebugTag
          v-if="result.direction"
          category="direction"
          :value="result.direction"
        />
        <DebugTag
          v-if="result.status"
          category="status"
          :value="result.status"
        />
        <span
          v-if="result.method"
          class="text-sm font-mono font-bold"
          :class="getMethodTabColor(result.method)"
        >
          {{ result.method }}
        </span>
        <span class="text-xs font-mono text-fg-muted ml-auto">{{
          result.timestamp
        }}</span>
      </div>

      <!-- Response -->
      <div v-if="result.type === 'http'" class="space-y-3">
        <h4
          class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted"
        >
          Response
        </h4>
        <div class="flex flex-wrap gap-2">
          <DetailTag field="statusCode" :value="result.statusCode" />
          <DetailTag
            v-if="result.responseTime > 0"
            field="responseTime"
            :value="result.responseTime"
          />
        </div>
      </div>

      <!-- Channels -->
      <div v-if="result.type === 'socket'" class="space-y-3">
        <h4
          class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted"
        >
          Channels
        </h4>
        <div class="flex flex-wrap gap-2">
          <DetailTag field="event" :value="result.event" />
          <DetailTag field="roomId" :value="result.roomId" />
          <DetailTag field="sessionId" :value="result.sessionId" />
        </div>
      </div>

      <!-- Model -->
      <div
        v-if="
          result.model ||
          result.numCtx ||
          result.preprocessing ||
          result.stream !== undefined
        "
        class="space-y-3"
      >
        <h4
          class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted"
        >
          Model
        </h4>
        <div class="flex flex-wrap gap-2">
          <DetailTag field="model" :value="result.model" />
          <DetailTag field="numCtx" :value="result.numCtx" />
          <DetailTag field="stream" :value="result.stream" />
          <DetailTag field="preprocessing" :value="result.preprocessing" />
        </div>
      </div>

      <!-- URL -->
      <div class="space-y-3">
        <h4
          class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5"
        >
          <Link2 class="w-3 h-3" />
          URL
        </h4>
        <div class="flex flex-wrap gap-2">
          <DetailTag field="endpoint" :value="parsedUrl.path" />
          <template v-if="parsedUrl.params.length">
            <template v-for="param in parsedUrl.params" :key="param.key">
              <div
                class="flex items-center bg-secondary rounded-none overflow-hidden relative border border-tab-mcp/30"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r"
                  :class="
                    getValueTypeGradient(param.value) ??
                    'from-tab-mcp/20 via-tab-mcp/5 to-transparent'
                  "
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 relative z-10 text-tab-mcp"
                  >{{ param.key }}</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 relative z-10 max-w-[200px] truncate"
                  :class="resolveParamColor(param.value)"
                  :title="param.value"
                  >{{ param.value }}</span
                >
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- Collapsible Data -->
      <div
        v-if="
          result.prompt ||
          result.requestBody ||
          result.responseBody ||
          result.requestHeaders
        "
        class="space-y-3 border-t border-divider pt-3"
      >
        <h4
          class="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted mb-2"
        >
          Request Data
        </h4>

        <!-- Request Headers -->
        <div v-if="result.requestHeaders" class="space-y-1.5">
          <div
            class="flex items-center gap-1.5 cursor-pointer group"
            @click="showHeaders = !showHeaders"
          >
            <ChevronRight
              class="w-3 h-3 text-fg-muted transition-transform duration-200"
              :class="showHeaders ? 'rotate-90' : ''"
            />
            <span
              class="text-[10px] font-mono font-bold uppercase text-fg-muted group-hover:text-accent-primary transition-colors"
              >Headers</span
            >
          </div>
          <pre
            v-show="showHeaders"
            class="text-xs font-mono text-fg-primary whitespace-pre-wrap break-word bg-secondary p-2 border border-divider"
            >{{ formatBody(result.requestHeaders as any) }}</pre
          >
        </div>

        <!-- Prompt -->
        <div v-if="result.prompt" class="space-y-1.5">
          <div
            class="flex items-center gap-1.5 cursor-pointer group"
            @click="showPrompt = !showPrompt"
          >
            <ChevronRight
              class="w-3 h-3 text-fg-muted transition-transform duration-200"
              :class="showPrompt ? 'rotate-90' : ''"
            />
            <span
              class="text-[10px] font-mono font-bold uppercase text-fg-muted group-hover:text-accent-primary transition-colors"
              >Prompt</span
            >
          </div>
          <pre
            v-show="showPrompt"
            class="text-xs font-mono text-fg-primary whitespace-pre-wrap break-word bg-secondary p-2 border border-divider"
            >{{ formatBody(result.prompt) }}</pre
          >
        </div>

        <!-- Request Body -->
        <div v-if="result.requestBody" class="space-y-1.5">
          <div
            class="flex items-center gap-1.5 cursor-pointer group"
            @click="showBody = !showBody"
          >
            <ChevronRight
              class="w-3 h-3 text-fg-muted transition-transform duration-200"
              :class="showBody ? 'rotate-90' : ''"
            />
            <span
              class="text-[10px] font-mono font-bold uppercase text-fg-muted group-hover:text-accent-primary transition-colors"
              >Body</span
            >
          </div>
          <pre
            v-show="showBody"
            class="text-xs font-mono text-fg-primary whitespace-pre-wrap break-word bg-secondary p-2 border border-divider"
            >{{ formatBody(result.requestBody) }}</pre
          >
        </div>

        <!-- Response Body -->
        <div v-if="result.responseBody" class="space-y-1.5">
          <div
            class="flex items-center gap-1.5 cursor-pointer group"
            @click="showResponse = !showResponse"
          >
            <ChevronRight
              class="w-3 h-3 text-fg-muted transition-transform duration-200"
              :class="showResponse ? 'rotate-90' : ''"
            />
            <span
              class="text-[10px] font-mono font-bold uppercase text-fg-muted group-hover:text-accent-primary transition-colors"
              >Response</span
            >
          </div>
          <pre
            v-show="showResponse"
            class="text-xs font-mono text-fg-primary whitespace-pre-wrap break-word bg-secondary p-2 border border-divider"
            >{{ formatBody(result.responseBody) }}</pre
          >
        </div>
      </div>

      <!-- Error -->
      <div v-if="result.errorMessage" class="space-y-2">
        <h4
          class="text-[10px] font-mono font-bold uppercase tracking-wider text-tab-debug"
        >
          Error
        </h4>
        <pre
          class="text-xs font-mono text-tab-debug whitespace-pre-wrap break-word bg-tab-debug/10 p-2 border border-tab-debug/30"
          >{{ result.errorMessage }}</pre
        >
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="p-8 flex flex-col items-center justify-center h-full min-h-44"
    >
      <div class="text-center space-y-2">
        <div class="text-fg-muted text-sm font-mono">
          Select a request from the list to view details
        </div>
        <div class="text-fg-secondary text-xs">
          Request information will appear here
        </div>
      </div>
    </div>
  </div>
</template>
