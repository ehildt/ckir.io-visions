import { computed } from 'vue';

import { useAppStore } from '../stores/app';
import { formatJson } from '../utils/formatting.helper';
import {
  getEvent as _getEvent,
  getRequestId as _getRequestId,
  getRoom as _getRoom,
  getStream as _getStream,
  getTask as _getTask,
  isAborted,
  isDone,
  isPending,
} from '../utils/message-data.helper';
import { useClipboard } from './use-clipboard';
import {
  getEventColor,
  getLoadingColor,
  getLoadingSecondaryColor,
  getRoomColor,
  getStatusColor,
} from './use-event-log.helper';

export function useEventLog() {
  const appStore = useAppStore();
  const abortingId = computed(() => appStore.abortingId);
  const { copiedAt, copy } = useClipboard(1500);

  function isAborting(data: unknown): boolean {
    const reqId = _getRequestId(data);
    return !!reqId && reqId === abortingId.value;
  }

  function isComplete(data: unknown): boolean {
    return !isPending(data) && !isAborted(data) && !isAborting(data);
  }

  function getStatus(
    data: unknown,
  ): 'pending' | 'aborting' | 'aborted' | 'complete' {
    if (isPending(data)) return 'pending';
    if (isAborting(data)) return 'aborting';
    if (isAborted(data)) return 'aborted';
    return 'complete';
  }

  function copyToClipboard(text: string) {
    copy(text);
  }

  return {
    copiedId: computed(() => (copiedAt.value ? Date.now() : null)),
    getEventColor,
    formatJson,
    getRoom: _getRoom,
    getEvent: _getEvent,
    getRequestId: _getRequestId,
    getTask: _getTask,
    getStream: _getStream,
    isPending,
    isAborted,
    isAborting,
    isComplete,
    isDone,
    getStatus,
    getStatusColor,
    copyToClipboard,
    getRoomColor,
    getLoadingColor,
    getLoadingSecondaryColor,
  };
}
