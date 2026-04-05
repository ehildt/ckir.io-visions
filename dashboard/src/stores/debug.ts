import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { DebugResult } from '../types/debug.model';
import type { TrackRequestDetails } from '../types/socket-provider.model';
import { extractPrompt } from '../utils/http.helper';
import { createId } from '../utils/id.helper';
import { createTrackingPromise, formatResponseBody } from './debug.helper';

export type { DebugResult };

export type { TrackRequestDetails } from '../types/socket-provider.model';

type DebugResultInput = Omit<DebugResult, 'id' | 'timestamp' | 'direction'>;

export const useDebugStore = defineStore('debug', () => {
  const debugResults = ref<DebugResult[]>([]);
  const selectedDebugResult = ref<DebugResult | null>(null);
  const lastSeenDebugCount = ref(0);
  const debugTabVisited = ref(false);

  // Computed: Count of debug results for the counter
  const debugLogCount = computed(() => {
    return debugResults.value.length;
  });

  function addDebugResult(result: DebugResultInput) {
    debugResults.value.unshift({
      id: createId(),
      timestamp: new Date().toLocaleTimeString(),
      direction: 'request',
      ...result,
    } as DebugResult);
  }

  function addSocketDebugEntry(result: {
    endpoint: string;
    method: string;
    status: 'success' | 'error';
    statusCode?: number;
    errorMessage?: string;
    responseTime: number;
    type: 'http' | 'socket';
    direction: 'request' | 'response';
    requestId?: string;
    roomId?: string;
    event?: string;
    stream?: boolean;
    sessionId?: string;
  }) {
    debugResults.value.unshift({
      id: createId(),
      timestamp: new Date().toLocaleTimeString(),
      ...result,
    } as DebugResult);
  }

  function trackRequest(
    endpoint: string,
    method: string,
    promise: Promise<Response>,
    details?: TrackRequestDetails,
  ) {
    const tracking = createTrackingPromise(promise);
    const prompt = extractPrompt(details?.formData);

    tracking.promise
      .then(async (res) => {
        const { responseTime, responseBody } = await (async () => {
          const time = Math.round(performance.now() - tracking.startTime);
          const text = await res.clone().text();
          const body = await formatResponseBody(text);
          return { responseTime: time, responseBody: body };
        })();

        addDebugResult({
          endpoint,
          method,
          status: res.ok ? 'success' : 'error',
          statusCode: res.status,
          errorMessage: res.ok ? undefined : responseBody,
          responseTime,
          type: 'http',
          requestHeaders: details?.headers,
          requestBody: details?.body,
          responseBody,
          requestId: details?.requestId,
          roomId: details?.roomId,
          event: details?.event,
          numCtx: details?.numCtx,
          stream: details?.stream,
          model: details?.model,
          prompt,
        });
        return res;
      })
      .catch((err) => {
        const responseTime = Math.round(performance.now() - tracking.startTime);
        addDebugResult({
          endpoint,
          method,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : String(err),
          responseTime,
          type: 'http',
          requestHeaders: details?.headers,
          requestBody: details?.body,
          prompt,
        });
        throw err;
      });

    return promise;
  }

  function clearDebugResults() {
    debugResults.value = [];
    lastSeenDebugCount.value = 0;
    selectedDebugResult.value = null;
  }

  function incrementDebugCount(newCount: number) {
    if (newCount > lastSeenDebugCount.value) {
      lastSeenDebugCount.value = newCount;
    }
  }

  function resetDebugCount() {
    lastSeenDebugCount.value = debugResults.value.length;
  }

  return {
    debugResults,
    selectedDebugResult,
    debugLogCount,
    lastSeenDebugCount,
    debugTabVisited,
    addDebugResult,
    addSocketDebugEntry,
    trackRequest,
    clearDebugResults,
    incrementDebugCount,
    resetDebugCount,
  };
});
