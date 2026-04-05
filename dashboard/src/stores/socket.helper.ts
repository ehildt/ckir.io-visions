import type { MessageData } from '../types/message.model';
import type { SocketProvider } from '../types/socket-provider.model';
import type { SocketDebugEntry } from './socket';

export function makeDebugEntry(
  partial: Omit<SocketDebugEntry, 'type' | 'responseTime' | 'sessionId'> & {
    responseTime?: number;
    sessionId?: string | null;
  },
): SocketDebugEntry {
  return {
    type: 'socket',
    responseTime: partial.responseTime ?? 0,
    sessionId: partial.sessionId ?? undefined,
    ...partial,
  } as SocketDebugEntry;
}

export function createSocketProvider(
  socketStore: {
    ensureSocketConnection: () => any;
    joinRoom?: (roomId: string, eventName: string) => void;
    leaveRoom?: (roomId: string, eventName: string) => void;
    listenToEvent?: (eventName: string) => void;
    stopListening?: () => void;
    connectedEvents: Set<string>;
    connectedRooms: Map<string, Set<string>>;
    getConnectedEventsAndRooms: () => string[];
    closeEvent: (eventName: string) => void;
    closeRoom: (eventName: string, roomId: string) => void;
  },
  debugStore: {
    trackRequest: SocketProvider['trackRequest'];
    addSocketDebugEntry: SocketProvider['addSocketDebugEntry'];
  },
  messageStore: {
    addMessage: (event: string, data: MessageData) => void;
    addPendingMessage: (
      event: string,
      roomId: string,
      requestId: string,
      task?: string,
      stream?: boolean,
    ) => void;
    updatePendingMessage: (requestId: string, data: MessageData) => void;
  },
): SocketProvider {
  return {
    getSocket: socketStore.ensureSocketConnection,
    joinRoom: socketStore.joinRoom,
    leaveRoom: socketStore.leaveRoom,
    listenToEvent: socketStore.listenToEvent,
    stopListening: socketStore.stopListening,
    trackRequest: debugStore.trackRequest,
    addMessage: messageStore.addMessage,
    addPendingMessage: messageStore.addPendingMessage,
    updatePendingMessage: messageStore.updatePendingMessage,
    connectedEvents: socketStore.connectedEvents,
    connectedRooms: socketStore.connectedRooms,
    getConnectedEventsAndRooms: socketStore.getConnectedEventsAndRooms,
    closeEvent: socketStore.closeEvent,
    closeRoom: socketStore.closeRoom,
    addSocketDebugEntry: debugStore.addSocketDebugEntry,
  };
}
