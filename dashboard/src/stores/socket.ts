import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { ref } from 'vue';

import { makeDebugEntry } from './socket.helper';

export type ConnectionState = 'connected' | 'disconnected' | 'error';

export interface SocketDebugEntry {
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
}

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<any>(null);
  const connectionState = ref<ConnectionState>('disconnected');
  const socketError = ref<string | null>(null);
  const lastConnectionEvent = ref<string>('disconnected');
  const socketId = ref<string | null>(null);

  const connectedEvents = ref<Set<string>>(new Set());
  const connectedRooms = ref<Map<string, Set<string>>>(new Map());

  const eventListeners = new Map<string, (...args: unknown[]) => void>();

  let pendingEvent: string | null = null;
  let addSocketDebugEntryCallback: ((entry: SocketDebugEntry) => void) | null =
    null;
  let addRestMessageCallback: ((event: string, data: unknown) => void) | null =
    null;
  let addMcpMessageCallback: ((event: string, data: unknown) => void) | null =
    null;

  // Track which request IDs have been logged to avoid duplicates for streaming
  const loggedRequestIds = ref<Set<string>>(new Set());

  function setCallbacks(
    onDebug: ((entry: SocketDebugEntry) => void) | null,
    onRestMessage: ((event: string, data: unknown) => void) | null,
    onMcpMessage: ((event: string, data: unknown) => void) | null,
  ) {
    addSocketDebugEntryCallback = onDebug;
    addRestMessageCallback = onRestMessage;
    addMcpMessageCallback = onMcpMessage;
  }

  function initSocket() {
    if (socket.value?.connected) return socket.value;
    if (socket.value) {
      socket.value.connect();
      return socket.value;
    }

    socket.value = io(import.meta.env.VITE_SOCKET_URL || '', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.value.on('connect', () => {
      connectionState.value = 'connected';
      socketError.value = null;
      socketId.value = socket.value?.id || null;

      if (lastConnectionEvent.value !== 'connected') {
        lastConnectionEvent.value = 'connected';
      }
      if (pendingEvent) {
        applyEventListener(pendingEvent);
        pendingEvent = null;
      }
    });

    socket.value.on('disconnect', () => {
      connectionState.value = 'disconnected';
      if (lastConnectionEvent.value !== 'disconnected') {
        lastConnectionEvent.value = 'disconnected';
      }
    });

    socket.value.on('connect_error', (err: Error) => {
      connectionState.value = 'error';
      socketError.value = err.message;
      if (lastConnectionEvent.value !== 'error') {
        lastConnectionEvent.value = 'error';
      }
    });

    return socket.value;
  }

  function ensureSocketConnection() {
    if (socket.value) {
      if (socket.value.connected) {
        return socket.value;
      }
      socket.value.connect();
      return socket.value;
    }

    return initSocket();
  }

  function listenToEvent(eventName: string) {
    if (!socket.value?.connected) {
      pendingEvent = eventName;
      return;
    }

    applyEventListener(eventName);
  }

  function applyEventListener(eventName: string) {
    if (eventListeners.has(eventName)) {
      connectedEvents.value.add(eventName);
      return;
    }

    const listener = (data: unknown) => {
      // Inject sessionId into the data before passing to message callback
      const dataWithSession = data as Record<string, unknown>;
      if (typeof dataWithSession === 'object' && dataWithSession !== null) {
        dataWithSession.sessionId = socketId.value;
      }

      // Route to both stores - each store will filter based on tracked request IDs
      addRestMessageCallback?.(eventName, dataWithSession);
      addMcpMessageCallback?.(eventName, dataWithSession);

      // Log socket data received in debug log
      const d = dataWithSession as {
        requestId?: string;
        roomId?: string;
        meta?: Array<{ requestId?: string }>;
        stream?: boolean;
      };
      const requestId = d?.requestId || d?.meta?.[0]?.requestId;

      if (requestId) {
        // Only log if we haven't logged this request ID yet (prevents duplicate entries for streaming)
        if (!loggedRequestIds.value.has(requestId)) {
          loggedRequestIds.value.add(requestId);
          addSocketDebugEntryCallback?.(
            makeDebugEntry({
              endpoint: `socket.io:${eventName}`,
              method: 'DATA',
              status: 'success',
              direction: 'response',
              requestId: requestId,
              roomId: d?.roomId,
              event: eventName,
              stream: d?.stream,
              sessionId: socketId.value || undefined,
            }),
          );
        }
      }
    };

    eventListeners.set(eventName, listener);
    socket.value!.on(eventName, listener);
    connectedEvents.value.add(eventName);

    addSocketDebugEntryCallback?.(
      makeDebugEntry({
        endpoint: `socket.io:${eventName}`,
        method: 'LISTEN',
        status: 'success',
        direction: 'request',
        sessionId: socketId.value || undefined,
      }),
    );
  }

  function stopListening() {
    if (!socket.value?.connected || connectedEvents.value.size === 0) return;

    const eventName = Array.from(connectedEvents.value)[0];
    const listener = eventListeners.get(eventName);
    if (listener) {
      socket.value!.off(eventName, listener);
      eventListeners.delete(eventName);
    }
    connectedEvents.value.delete(eventName);
  }

  function closeEvent(eventName: string) {
    if (connectedEvents.value.has(eventName)) {
      const listener = eventListeners.get(eventName);
      if (listener) {
        socket.value!.off(eventName, listener);
        eventListeners.delete(eventName);
      }

      const rooms = connectedRooms.value.get(eventName);
      if (rooms) {
        rooms.forEach((roomId) => {
          socket.value!.emit('leave', roomId);
        });
        connectedRooms.value.delete(eventName);
      }

      connectedEvents.value.delete(eventName);

      addSocketDebugEntryCallback?.(
        makeDebugEntry({
          endpoint: `socket.io:${eventName}`,
          method: 'UNLISTEN',
          status: 'success',
          direction: 'request',
          sessionId: socketId.value || undefined,
        }),
      );
    }
  }

  function closeRoom(eventName: string, roomId: string) {
    const rooms = connectedRooms.value.get(eventName);
    if (rooms && rooms.has(roomId)) {
      socket.value!.emit('leave', roomId);
      rooms.delete(roomId);

      if (rooms.size === 0) {
        connectedRooms.value.delete(eventName);
      }

      addSocketDebugEntryCallback?.(
        makeDebugEntry({
          endpoint: `socket.io:${eventName}:room:${roomId}`,
          method: 'LEAVE',
          status: 'success',
          direction: 'request',
          event: eventName,
          roomId: roomId,
          sessionId: socketId.value || undefined,
        }),
      );
    }
  }

  function joinRoom(roomId: string, eventName: string) {
    if (socket.value?.connected) {
      socket.value.emit('join', roomId);

      if (!connectedRooms.value.has(eventName)) {
        connectedRooms.value.set(eventName, new Set());
      }
      connectedRooms.value.get(eventName)!.add(roomId);

      addSocketDebugEntryCallback?.(
        makeDebugEntry({
          endpoint: `socket.io:${eventName}:room:${roomId}`,
          method: 'JOIN',
          status: 'success',
          direction: 'request',
          event: eventName,
          roomId: roomId,
          sessionId: socketId.value || undefined,
        }),
      );
    }
  }

  function leaveRoom(roomId: string, eventName: string) {
    if (socket.value?.connected) {
      socket.value.emit('leave', roomId);

      const rooms = connectedRooms.value.get(eventName);
      if (rooms) {
        rooms.delete(roomId);
        if (rooms.size === 0) {
          connectedRooms.value.delete(eventName);
        }
      }

      addSocketDebugEntryCallback?.(
        makeDebugEntry({
          endpoint: `socket.io:${eventName}:room:${roomId}`,
          method: 'LEAVE',
          status: 'success',
          direction: 'request',
          event: eventName,
          roomId: roomId,
          sessionId: socketId.value || undefined,
        }),
      );
    }
  }

  function getConnectedEventsAndRooms() {
    const result: string[] = [];
    const sortedEvents = Array.from(connectedEvents.value).sort();
    for (const event of sortedEvents) {
      const rooms = connectedRooms.value.get(event);
      if (rooms && rooms.size > 0) {
        const sortedRooms = Array.from(rooms).sort();
        result.push(`${event}::${sortedRooms.join('::')}`);
      } else {
        result.push(event);
      }
    }
    return result;
  }

  return {
    socket,
    connectionState,
    socketError,
    lastConnectionEvent,
    socketId,
    connectedEvents,
    connectedRooms,
    setCallbacks,
    initSocket,
    ensureSocketConnection,
    joinRoom,
    leaveRoom,
    listenToEvent,
    stopListening,
    closeEvent,
    closeRoom,
    getConnectedEventsAndRooms,
  };
});
