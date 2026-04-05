import type { Ref } from 'vue';

export type ToastApi = {
  error: (message: string) => void;
  warning: (message: string) => void;
};

export function requireModel(model: Ref<string>, toast: ToastApi): boolean {
  if (!model.value.trim()) {
    toast.error('Model is required (e.g., llama3.2-vision, ministral-3:14b)');
    return false;
  }
  return true;
}

export function requireFiles(
  files: Ref<File[]>,
  toast: ToastApi,
  errorMessage = 'At least one image is required',
): boolean {
  if (!files.value.length) {
    toast.error(errorMessage);
    return false;
  }
  return true;
}

export function validateConnection(
  eventName: string,
  room: string,
  isEventConnected: (eventName: string) => boolean,
  isRoomConnected: (eventName: string, roomName: string) => boolean,
  startConnectButtonBlink: () => void,
  toast: ToastApi,
): boolean {
  if (
    !isEventConnected(eventName) ||
    (room && !isRoomConnected(eventName, room))
  ) {
    startConnectButtonBlink();
    toast.warning(`Not subscribed to ${eventName || 'any event'}`);
    return false;
  }
  return true;
}
