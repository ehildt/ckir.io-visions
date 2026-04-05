export function getRoom(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'roomId' in data) {
    return (data as { roomId?: string }).roomId;
  }
  return undefined;
}

export function getEvent(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'event' in data) {
    return (data as { event?: string }).event;
  }
  return undefined;
}

export function getRequestId(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'requestId' in data) {
    return (data as { requestId?: string }).requestId;
  }
  return undefined;
}

export function getTask(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'task' in data) {
    return (data as { task?: string }).task;
  }
  return undefined;
}

export function getStream(data: unknown): boolean | undefined {
  if (data && typeof data === 'object' && 'stream' in data) {
    return (data as { stream?: boolean }).stream;
  }
  return undefined;
}

export function isPending(data: unknown): boolean {
  return !!(
    data &&
    typeof data === 'object' &&
    'pending' in (data as any) &&
    (data as any).pending === true
  );
}

export function isAborted(data: unknown): boolean {
  return !!(
    data &&
    typeof data === 'object' &&
    'aborted' in (data as any) &&
    (data as any).aborted === true
  );
}

export function isDone(data: unknown): boolean {
  return !!(
    data &&
    typeof data === 'object' &&
    'done' in (data as any) &&
    (data as any).done === true
  );
}
