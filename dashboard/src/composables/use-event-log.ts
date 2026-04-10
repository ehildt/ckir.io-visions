import type { Ref } from 'vue';
import { ref } from 'vue';

export function useEventLog(abortingId: Ref<string | null | undefined>) {
  const copiedId = ref<number | null>(null);

  function getEventColor(event: string): string {
    if (event.includes('error') || event.includes('Error')) {
      return 'text-error';
    }
    if (event.includes('connect')) {
      return 'text-success';
    }
    if (event.includes('abort')) {
      return 'text-error';
    }
    return 'text-warning';
  }

  function formatJson(data: unknown): string {
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (
        'message' in d &&
        d.message &&
        typeof d.message === 'object' &&
        'content' in (d.message as any)
      ) {
        return (d.message as any).content;
      }
      const filtered = Object.fromEntries(
        Object.keys(d)
          .filter((k) => k !== 'pending')
          .map((k) => [k, d[k]]),
      );
      return JSON.stringify(filtered, null, 2);
    }
    return JSON.stringify(data, null, 2);
  }

  function getRoom(data: unknown): string | undefined {
    if (data && typeof data === 'object' && 'roomId' in data) {
      return (data as { roomId?: string }).roomId;
    }
    return undefined;
  }

  function getEvent(data: unknown): string | undefined {
    if (data && typeof data === 'object' && 'event' in data) {
      return (data as { event?: string }).event;
    }
    return undefined;
  }

  function getRequestId(data: unknown): string | undefined {
    if (data && typeof data === 'object' && 'requestId' in data) {
      return (data as { requestId?: string }).requestId;
    }
    return undefined;
  }

  function getTask(data: unknown): string | undefined {
    if (data && typeof data === 'object' && 'task' in data) {
      return (data as { task?: string }).task;
    }
    return undefined;
  }

  function getStream(data: unknown): boolean | undefined {
    if (data && typeof data === 'object' && 'stream' in data) {
      return (data as { stream?: boolean }).stream;
    }
    return undefined;
  }

  function isPending(data: unknown): boolean {
    return !!(
      data &&
      typeof data === 'object' &&
      'pending' in (data as any) &&
      (data as any).pending === true
    );
  }

  function isAborted(data: unknown): boolean {
    return !!(
      data &&
      typeof data === 'object' &&
      'aborted' in (data as any) &&
      (data as any).aborted === true
    );
  }

  function isAborting(data: unknown): boolean {
    const reqId = getRequestId(data);
    return !!reqId && reqId === abortingId.value;
  }

  function isComplete(data: unknown): boolean {
    return !isPending(data) && !isAborted(data) && !isAborting(data);
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text).then(() => {
      copiedId.value = index;
      setTimeout(() => {
        copiedId.value = null;
      }, 1500);
    });
  }

  return {
    copiedId,
    getEventColor,
    formatJson,
    getRoom,
    getEvent,
    getRequestId,
    getTask,
    getStream,
    isPending,
    isAborted,
    isAborting,
    isComplete,
    copyToClipboard,
  };
}
