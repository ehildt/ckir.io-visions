import { ref } from 'vue';

import type { SocketProvider } from '../types/socket-provider.model';

export function useSocketConnect(socketProvider: SocketProvider) {
  const connectButtonBlinking = ref(false);

  function triggerConnectButtonBlink() {
    connectButtonBlinking.value = true;
    setTimeout(() => {
      connectButtonBlinking.value = false;
    }, 1500);
  }

  async function connect(eventName: string, room?: string) {
    eventName = eventName.trim();
    const roomName = room?.trim();
    if (!eventName) return;

    const socket = socketProvider.getSocket();
    if (!socket?.connected) {
      console.warn('Socket not connected, waiting...');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!isEventConnected(eventName)) {
      socketProvider.listenToEvent?.(eventName);
    }

    if (roomName && !isRoomConnected(eventName, roomName)) {
      socketProvider.joinRoom?.(roomName, eventName);
    }
  }

  function isEventConnected(eventName: string): boolean {
    return socketProvider.connectedEvents.value.has(eventName);
  }

  function isRoomConnected(eventName: string, roomName: string): boolean {
    const rooms = socketProvider.connectedRooms.value.get(eventName);
    return rooms ? rooms.has(roomName) : false;
  }

  return {
    connectButtonBlinking,
    triggerConnectButtonBlink,
    connect,
    isEventConnected,
    isRoomConnected,
  };
}
