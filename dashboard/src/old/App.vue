<script setup lang="ts">
import { io, Socket } from 'socket.io-client';
import { onMounted, ref, watch } from 'vue';

import DebugPanel from './components/DebugPanel.vue';
import McpPanel from './components/McpPanel.vue';
import RestPanel from './components/RestPanel.vue';
import ResultViewer from './components/ResultViewer.vue';

import '../assets/css/style.css';

type ThemeName =
  | 'souls'
  | 'diablo'
  | 'berserk'
  | 'cyberpunk'
  | 'stellar'
  | 'ghostwire'
  | 'deathspace'
  | 'nioh';

const activeTab = ref<'rest' | 'mcp' | 'debug'>('rest');
const messages = ref<Array<{ time: string; event: string; data: unknown }>>([]);
const abortingId = ref<string | null>(null);
const blinkLogo = ref(true);
const currentTheme = ref<ThemeName>('souls');

function handleModelSelected() {
  blinkLogo.value = true;
  setTimeout(() => {
    blinkLogo.value = false;
  }, 3000);
}

const darkThemes = ['souls', 'diablo', 'berserk', 'cyberpunk', 'stellar'];
const darkThemes2 = ['ghostwire', 'deathspace', 'nioh'];

onMounted(() => {
  const saved = localStorage.getItem('theme') as ThemeName;
  if (
    saved &&
    [
      'souls',
      'diablo',
      'berserk',
      'cyberpunk',
      'stellar',
      'ghostwire',
      'deathspace',
      'nioh',
    ].includes(saved)
  ) {
    currentTheme.value = saved;
  }
  applyTheme(currentTheme.value);
});

watch(currentTheme, (newTheme) => {
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});

function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute('data-theme', theme);
}

const themeColors: Record<ThemeName, { name: string; primary: string }> = {
  souls: { name: 'Souls', primary: '#ff8c00' },
  diablo: { name: 'Diablo', primary: '#dc143c' },
  berserk: { name: 'Berserk', primary: '#8b0000' },
  cyberpunk: { name: 'Cyberpunk', primary: '#00ffff' },
  stellar: { name: 'Stellar', primary: '#ff1493' },
  ghostwire: { name: 'Ghostwire', primary: '#00ffbf' },
  deathspace: { name: 'DeathSpace', primary: '#b967ff' },
  nioh: { name: 'Nioh', primary: '#e60012' },
};

const selectedDebugResult = ref<{
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  statusCode?: number;
  errorMessage?: string;
  responseTime: number;
  type: 'http' | 'socket';
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  requestId?: string;
  roomId?: string;
  event?: string;
  numCtx?: string;
  stream?: boolean;
  model?: string;
  prompt?: string;
  direction?: 'request' | 'response';
} | null>(null);

const connectionState = ref<'connected' | 'disconnected' | 'error'>(
  'disconnected',
);
const socketError = ref<string | null>(null);
const lastConnectionEvent = ref<string>('disconnected');

const connectedEvents = ref<Set<string>>(new Set());
const connectedRooms = ref<Map<string, Set<string>>>(new Map());

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

const debugLogCount = ref(0);
const lastSeenDebugCount = ref(0);
const debugTabVisited = ref(false);

const debugResults = ref<
  Array<{
    id: string;
    timestamp: string;
    endpoint: string;
    method: string;
    status: 'success' | 'error';
    statusCode?: number;
    errorMessage?: string;
    responseTime: number;
    type: 'http' | 'socket';
    direction?: 'request' | 'response';
    requestHeaders?: Record<string, string>;
    requestBody?: string;
    prompt?: string;
  }>
>([]);

let socket: Socket | null = null;

watch(
  debugResults,
  (newResults, oldResults) => {
    const oldLength = oldResults?.length || 0;
    const newLength = newResults?.length || 0;
    console.log(
      `[DEBUG] debugResults changed: ${oldLength} -> ${newLength}, activeTab: ${activeTab.value}`,
    );
    if (newLength > oldLength && activeTab.value !== 'debug') {
      const newCount = newLength - lastSeenDebugCount.value;
      debugLogCount.value = Math.max(0, newCount);
      console.log(
        `[DEBUG] New logs while not on debug tab: ${debugLogCount.value}`,
      );
    }
  },
  { deep: true },
);

watch(activeTab, (newTab) => {
  console.log(
    `[DEBUG] Tab changed to: ${newTab}, current debugLogCount: ${debugLogCount.value}, lastSeen: ${lastSeenDebugCount.value}, total: ${debugResults.value.length}`,
  );
  if (newTab === 'debug') {
    debugTabVisited.value = true;
    lastSeenDebugCount.value = debugResults.value.length;
    debugLogCount.value = 0;
    console.log(`[DEBUG] Reset counter - visiting debug tab`);
  } else {
    debugTabVisited.value = false;
    lastSeenDebugCount.value = debugResults.value.length;
    console.log(
      `[DEBUG] Leaving debug tab, lastSeen updated to: ${lastSeenDebugCount.value}`,
    );
  }
  blinkLogo.value = true;
  setTimeout(() => {
    blinkLogo.value = false;
  }, 3000);
});

function addPendingMessage(
  event: string,
  roomId: string,
  requestId: string,
  task?: string,
  stream?: boolean,
) {
  console.log(
    '[addPendingMessage] event:',
    event,
    'roomId:',
    roomId,
    'requestId:',
    requestId,
    'task:',
    task,
    'stream:',
    stream,
  );
  messages.value.unshift({
    time: new Date().toLocaleTimeString(),
    event,
    data: {
      pending: true,
      requestId,
      event,
      roomId: roomId || undefined,
      task: task || undefined,
      stream: stream ?? undefined,
    },
  });
}

function updatePendingMessage(requestId: string, data: unknown) {
  const msg = messages.value.find(
    (m) =>
      m.event === (data as any)?.event &&
      (m.data as any)?.requestId === requestId,
  );
  if (msg && (msg.data as any)?.pending) {
    msg.data = { ...(msg.data as object), ...(data as object), pending: false };
  }
}

function addMessage(event: string, data: unknown) {
  console.log(
    '[addMessage] received event:',
    event,
    'data:',
    JSON.stringify(data).slice(0, 200),
  );
  const d = data as any;
  const requestId = d?.requestId || d?.meta?.[0]?.requestId;
  console.log('[addMessage] extracted requestId:', requestId);

  if (d?.canceled || d?.status === 'canceled') {
    console.log('[addMessage] skipping canceled message');
    return;
  }

  if (requestId) {
    const existing = messages.value.find(
      (m) =>
        (m.data as any)?.requestId === requestId ||
        (m.data as any)?.meta?.[0]?.requestId === requestId,
    );
    console.log(
      '[addMessage] found existing message:',
      existing ? 'yes' : 'no',
    );

    if (existing) {
      const existingContent = (existing.data as any)?.message?.content;
      const newContent = d?.message?.content;
      console.log(
        '[addMessage] existingContent:',
        existingContent?.slice(0, 50),
        'newContent:',
        newContent?.slice(0, 50),
      );

      if (newContent) {
        if (existingContent !== undefined) {
          (existing.data as any).message.content = existingContent + newContent;
          console.log(
            '[addMessage] appended content, new length:',
            (existing.data as any).message.content.length,
          );
        } else {
          (existing.data as any).message = d.message;
          console.log('[addMessage] set new message');
        }
      }
      if (!d?.aborted) {
        delete (existing.data as any).pending;
      }
      return;
    }
  }

  messages.value.unshift({
    time: new Date().toLocaleTimeString(),
    event,
    data,
  });
}

function addDebugResult(result: {
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  statusCode?: number;
  errorMessage?: string;
  responseTime: number;
  type?: 'http' | 'socket';
  direction?: 'request' | 'response';
  requestHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  requestId?: string;
  roomId?: string;
  event?: string;
  numCtx?: string;
  stream?: boolean;
  model?: string;
  prompt?: string;
}) {
  debugResults.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    type: result.type || 'http',
    direction: result.direction || 'request',
    ...result,
  });
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
}) {
  debugResults.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    ...result,
  });
}

function initSocket() {
  if (socket?.connected) return socket;
  if (socket) {
    // Log connection attempt (request)
    addSocketDebugEntry({
      endpoint: 'socket.io',
      method: 'CONNECT',
      status: 'success',
      responseTime: 0,
      type: 'socket',
      direction: 'request',
    });
    socket.connect();
    return socket;
  }

  // Log initial connection attempt (request)
  addSocketDebugEntry({
    endpoint: 'socket.io',
    method: 'CONNECT',
    status: 'success',
    responseTime: 0,
    type: 'socket',
    direction: 'request',
  });

  socket = io('/', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    connectionState.value = 'connected';
    socketError.value = null;
    console.log('[App] Socket connected');

    if (lastConnectionEvent.value !== 'connected') {
      lastConnectionEvent.value = 'connected';
      addSocketDebugEntry({
        endpoint: 'socket.io',
        method: 'CONNECT',
        status: 'success',
        responseTime: 0,
        type: 'socket',
        direction: 'response',
      });
    }
    if (pendingEvent) {
      applyEventListener(pendingEvent);
      pendingEvent = null;
    }
  });

  socket.on('disconnect', (reason) => {
    connectionState.value = 'disconnected';
    if (lastConnectionEvent.value !== 'disconnected') {
      lastConnectionEvent.value = 'disconnected';
      addSocketDebugEntry({
        endpoint: 'socket.io',
        method: 'DISCONNECT',
        status: 'error',
        errorMessage: `Disconnected: ${reason}`,
        responseTime: 0,
        type: 'socket',
        direction: 'response',
      });
    }
  });

  socket.on('connect_error', (err) => {
    connectionState.value = 'error';
    socketError.value = err.message;
    if (lastConnectionEvent.value !== 'error') {
      lastConnectionEvent.value = 'error';
      addSocketDebugEntry({
        endpoint: 'socket.io',
        method: 'CONNECT_ERROR',
        status: 'error',
        errorMessage: err.message,
        responseTime: 0,
        type: 'socket',
        direction: 'response',
      });
    }
  });

  return socket;
}

// Track active connections to prevent unnecessary reconnects
const activeConnections = new Set<string>();

function ensureSocketConnection(event?: string, room?: string) {
  // If we already have a connected socket and no specific event/room is requested, return existing socket
  if (socket && event === undefined && room === undefined) {
    if (socket.connected) {
      return socket;
    }
    socket.connect();
    return socket;
  }

  // If we already have a socket, just return it without disconnecting
  // The caller should handle joining rooms and setting up listeners
  if (socket) {
    if (socket.connected) {
      // Track this connection
      if (event) {
        const key = room ? `${event}::${room}` : event;
        activeConnections.add(key);
      }
      return socket;
    }
    // If not connected but exists, try to connect (don't create new)
    socket.connect();
    return socket;
  }

  // No socket exists, create one
  return initSocket();
}

let pendingEvent: string | null = null;

function listenToEvent(eventName: string) {
  if (!socket?.connected) {
    pendingEvent = eventName;
    return;
  }

  applyEventListener(eventName);
}

const eventListeners = new Map<string, (...args: any[]) => void>();

function applyEventListener(eventName: string) {
  // If already listening to this event, don't add another listener
  if (eventListeners.has(eventName)) {
    console.log(`[App] Already listening to: ${eventName}`);
    connectedEvents.value.add(eventName);
    return;
  }

  const listener = (data: unknown) => {
    console.log(
      '[applyEventListener] received data for event',
      eventName,
      ':',
      JSON.stringify(data).slice(0, 100),
    );
    addMessage(eventName, data);
  };

  eventListeners.set(eventName, listener);
  socket!.on(eventName, listener);
  connectedEvents.value.add(eventName);
  console.log(`[App] Now listening to: ${eventName}`);

  addSocketDebugEntry({
    endpoint: `socket.io:${eventName}`,
    method: 'LISTEN',
    status: 'success',
    responseTime: 0,
    type: 'socket',
    direction: 'request',
  });
}

function stopListening() {
  console.log(`[App] stopListening called`);
  if (!socket?.connected || connectedEvents.value.size === 0) return;

  const eventName = Array.from(connectedEvents.value)[0];
  const listener = eventListeners.get(eventName);
  if (listener) {
    socket!.off(eventName, listener);
    eventListeners.delete(eventName);
  }
  connectedEvents.value.delete(eventName);

  addSocketDebugEntry({
    endpoint: `socket.io:${eventName}`,
    method: 'UNLISTEN',
    status: 'success',
    responseTime: 0,
    type: 'socket',
    direction: 'request',
  });
}

function closeEvent(eventName: string) {
  if (connectedEvents.value.has(eventName)) {
    // Stop listening to the event
    const listener = eventListeners.get(eventName);
    if (listener) {
      socket!.off(eventName, listener);
      eventListeners.delete(eventName);
    }

    // Leave all rooms for this event
    const rooms = connectedRooms.value.get(eventName);
    if (rooms) {
      rooms.forEach((roomId) => {
        socket!.emit('leave', roomId);
      });
      connectedRooms.value.delete(eventName);
    }

    connectedEvents.value.delete(eventName);

    addSocketDebugEntry({
      endpoint: `socket.io:${eventName}`,
      method: 'UNLISTEN',
      status: 'success',
      responseTime: 0,
      type: 'socket',
      direction: 'request',
    });

    console.log(`[App] Closed event: ${eventName}`);
  }
}

function closeRoom(eventName: string, roomId: string) {
  const rooms = connectedRooms.value.get(eventName);
  if (rooms && rooms.has(roomId)) {
    socket!.emit('leave', roomId);
    rooms.delete(roomId);

    if (rooms.size === 0) {
      connectedRooms.value.delete(eventName);
    }

    addSocketDebugEntry({
      endpoint: `socket.io:room:${roomId}`,
      method: 'LEAVE',
      status: 'success',
      responseTime: 0,
      type: 'socket',
      direction: 'request',
    });

    console.log(`[App] Closed room: ${roomId} for event: ${eventName}`);
  }
}

function joinRoom(roomId: string, eventName: string) {
  if (socket?.connected) {
    socket.emit('join', roomId);

    // Track room under its event
    if (!connectedRooms.value.has(eventName)) {
      connectedRooms.value.set(eventName, new Set());
    }
    connectedRooms.value.get(eventName)!.add(roomId);

    console.log(`[App] Joined room: ${roomId} for event: ${eventName}`);

    addSocketDebugEntry({
      endpoint: `socket.io:room:${roomId}`,
      method: 'JOIN',
      status: 'success',
      responseTime: 0,
      type: 'socket',
      direction: 'request',
    });
  } else {
    console.warn('Cannot join room - socket not connected');
  }
}

function leaveRoom(roomId: string, eventName: string) {
  if (socket?.connected) {
    socket.emit('leave', roomId);

    // Remove room from event tracking
    const rooms = connectedRooms.value.get(eventName);
    if (rooms) {
      rooms.delete(roomId);
      if (rooms.size === 0) {
        connectedRooms.value.delete(eventName);
      }
    }

    console.log(`[App] Left room: ${roomId} for event: ${eventName}`);

    addSocketDebugEntry({
      endpoint: `socket.io:room:${roomId}`,
      method: 'LEAVE',
      status: 'success',
      responseTime: 0,
      type: 'socket',
      direction: 'request',
    });
  } else {
    console.warn('Cannot leave room - socket not connected');
  }
}

function abortJob(requestId: string): Promise<boolean> {
  console.log('[DEBUG] abortJob called with requestId:', requestId);
  abortingId.value = requestId;

  return fetch('/api/v1/vision/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId }),
  })
    .then(async (res) => {
      console.log('[DEBUG] Abort API response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.warn('Abort failed:', text);
        abortingId.value = null;
        return false;
      }
      const data = await res.json();
      console.log('[DEBUG] Abort API response data:', data);
      if (data.success) {
        removeMessage(requestId);
      }
      abortingId.value = null;
      return data.success ?? false;
    })
    .catch((err) => {
      console.error('Failed to abort job:', err);
      abortingId.value = null;
      return false;
    });
}

function removeMessage(requestId: string) {
  const index = messages.value.findIndex(
    (m) => (m.data as any)?.requestId === requestId,
  );
  if (index !== -1) {
    messages.value.splice(index, 1);
  }
}

function trackRequest(
  endpoint: string,
  method: string,
  promise: Promise<Response>,
  details?: {
    headers?: Record<string, string>;
    body?: string;
    formData?: FormData;
    requestId?: string;
    roomId?: string;
    event?: string;
    numCtx?: string;
    stream?: boolean;
    model?: string;
    direction?: 'request' | 'response';
  },
) {
  const startTime = performance.now();

  let prompt: string | undefined;
  if (details?.formData) {
    const promptValue = details.formData.get('prompt');
    if (promptValue && typeof promptValue === 'string') {
      prompt = promptValue;
    }

    if (!prompt) {
      const payloadValue = details.formData.get('payload');
      if (payloadValue && typeof payloadValue === 'string') {
        try {
          const payload = JSON.parse(payloadValue);
          if (payload.params?.arguments?.prompt) {
            prompt = JSON.stringify(payload.params.arguments.prompt);
          }
        } catch {}
      }
    }
  }

  promise
    .then(async (res) => {
      const responseTime = performance.now() - startTime;
      const clonedResponse = res.clone();
      const responseBody = await clonedResponse.text();

      if (res.ok) {
        addDebugResult({
          endpoint,
          method,
          status: 'success',
          statusCode: res.status,
          responseTime: Math.round(responseTime),
          type: 'http',
          requestHeaders: details?.headers,
          requestBody: details?.body,
          responseBody: responseBody,
          requestId: details?.requestId,
          roomId: details?.roomId,
          event: details?.event,
          numCtx: details?.numCtx,
          stream: details?.stream,
          model: details?.model,
          prompt: prompt,
        });
      } else {
        addDebugResult({
          endpoint,
          method,
          status: 'error',
          statusCode: res.status,
          errorMessage: responseBody,
          responseTime: Math.round(responseTime),
          type: 'http',
          requestHeaders: details?.headers,
          requestBody: details?.body,
          responseBody: responseBody,
          requestId: details?.requestId,
          roomId: details?.roomId,
          event: details?.event,
          numCtx: details?.numCtx,
          stream: details?.stream,
          model: details?.model,
          prompt: prompt,
        });
      }
      return res;
    })
    .catch((err) => {
      const responseTime = performance.now() - startTime;
      addDebugResult({
        endpoint,
        method,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : String(err),
        responseTime: Math.round(responseTime),
        type: 'http',
        requestHeaders: details?.headers,
        requestBody: details?.body,
        prompt: prompt,
      });
      throw err;
    });

  return promise;
}

const provideSocket = {
  getSocket: ensureSocketConnection,
  joinRoom,
  leaveRoom,
  trackRequest,
  addMessage,
  addPendingMessage,
  updatePendingMessage,
  listenToEvent,
  stopListening,
  abortJob,
  connectedEvents: connectedEvents,
  connectedRooms: connectedRooms,
  getConnectedEventsAndRooms,
  closeEvent,
  closeRoom,
};

const models = ref<string[]>([]);
const modelsLoading = ref(false);

async function fetchModels() {
  modelsLoading.value = true;
  try {
    const res = await fetch('/api/v1/vision/models');
    if (res.ok) {
      const data = await res.json();
      models.value = data.models?.map((m: { model: string }) => m.model) ?? [];
    }
  } catch (e) {
    console.error('Failed to fetch models:', e);
  } finally {
    modelsLoading.value = false;
  }
}

onMounted(() => {
  const saved = localStorage.getItem('theme') as ThemeName;
  if (
    saved &&
    [
      'souls',
      'diablo',
      'berserk',
      'cyberpunk',
      'stellar',
      'ghostwire',
      'deathspace',
      'nioh',
    ].includes(saved)
  ) {
    currentTheme.value = saved;
  }
  applyTheme(currentTheme.value);

  fetchModels();

  lastSeenDebugCount.value = debugResults.value.length;

  setTimeout(() => {
    blinkLogo.value = false;
  }, 3000);
});
</script>

<template>
  <div class="min-h-screen bg-primary text-fg-primary font-sans pb-12 bg-grid">
    <header
      class="fixed top-0 left-0 right-0 border-b border-divider bg-secondary z-40"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-none bg-transparent border-2 border-success flex items-center justify-center"
            >
              <span
                class="text-gold font-mono font-bold text-lg"
                :class="blinkLogo ? 'animate-blink-3' : 'animate-blink-stop'"
                >V</span
              >
            </div>
            <div>
              <h1 class="text-xl font-bold tracking-wider font-mono">
                <span class="text-success">ckir.io</span
                ><span class="text-fg-muted">/</span
                ><span class="text-success">visions</span>
                <span class="text-brand-muted">_</span>
              </h1>
              <p class="text-xs text-fg-muted font-mono">
                AI Vision Testing Console
              </p>
            </div>
          </div>

          <div class="flex gap-0 border border-divider">
            <button
              class="px-4 py-2 text-xs font-mono transition-all duration-200"
              :class="
                activeTab === 'rest'
                  ? 'bg-success text-black font-bold'
                  : 'text-fg-secondary hover:text-success hover:bg-tertiary'
              "
              @click="activeTab = 'rest'"
            >
              &gt; REST_
            </button>
            <button
              class="px-4 py-2 text-xs font-mono transition-all duration-200 border-l border-divider"
              :class="
                activeTab === 'mcp'
                  ? 'bg-brand-muted text-black font-bold'
                  : 'text-fg-secondary hover:text-brand-muted hover:bg-tertiary'
              "
              @click="activeTab = 'mcp'"
            >
              &gt; MCP_
            </button>
            <button
              class="px-4 py-2 text-xs font-mono transition-all duration-200 border-l border-divider flex items-center gap-2 relative overflow-visible"
              :class="
                activeTab === 'debug'
                  ? 'bg-pink text-black font-bold'
                  : 'text-fg-secondary hover:text-pink hover:bg-tertiary'
              "
              @click="activeTab = 'debug'"
            >
              &gt; DEBUG_
              <span
                v-if="debugLogCount > 0 && activeTab !== 'debug'"
                class="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-[10px] bg-error text-white font-bold rounded-full z-50 border border-white/20 shadow-lg animate-pulse"
              >
                {{ debugLogCount > 99 ? '99+' : debugLogCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div
      class="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0.5 pr-0 w-40 pointer-events-none font-mono"
    >
      <template v-for="name in darkThemes" :key="name">
        <button
          class="group relative h-10 w-full flex items-center justify-end pointer-events-auto"
          @click="currentTheme = name as ThemeName"
        >
          <div
            class="w-28 h-full flex items-center justify-end pr-2 transition-all duration-300"
            :style="{
              background:
                currentTheme === name
                  ? `linear-gradient(to left, ${themeColors[name as ThemeName].primary}88, ${themeColors[name as ThemeName].primary}20 30%, transparent)`
                  : `linear-gradient(to left, ${themeColors[name as ThemeName].primary}15, transparent 60%)`,
            }"
          >
            <span
              class="text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
              :class="
                currentTheme === name
                  ? 'text-white'
                  : 'text-white/20 group-hover:text-white/80 group-hover:bg-none'
              "
              :style="
                currentTheme !== name
                  ? {
                      textShadow: `0 0 8px ${themeColors[name as ThemeName].primary}40`,
                    }
                  : {}
              "
            >
              {{ themeColors[name as ThemeName].name }}
            </span>
          </div>
        </button>
      </template>
      <template v-for="name in darkThemes2" :key="name">
        <button
          class="group relative h-10 w-full flex items-center justify-end pointer-events-auto"
          @click="currentTheme = name as ThemeName"
        >
          <div
            class="w-28 h-full flex items-center justify-end pr-2 transition-all duration-300"
            :style="{
              background:
                currentTheme === name
                  ? `linear-gradient(to left, ${themeColors[name as ThemeName].primary}88, ${themeColors[name as ThemeName].primary}20 30%, transparent)`
                  : `linear-gradient(to left, ${themeColors[name as ThemeName].primary}15, transparent 60%)`,
            }"
          >
            <span
              class="text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
              :class="
                currentTheme === name
                  ? 'text-white'
                  : 'text-white/20 group-hover:text-white/80 group-hover:bg-none'
              "
              :style="
                currentTheme !== name
                  ? {
                      textShadow: `0 0 8px ${themeColors[name as ThemeName].primary}40`,
                    }
                  : {}
              "
            >
              {{ themeColors[name as ThemeName].name }}
            </span>
          </div>
        </button>
      </template>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-6">
          <RestPanel
            v-if="activeTab === 'rest'"
            :socket-provider="provideSocket"
            :models="models"
            :models-loading="modelsLoading"
            :connection-state="connectionState"
            @refresh-models="fetchModels"
            @model-selected="handleModelSelected"
          />
          <McpPanel
            v-else-if="activeTab === 'mcp'"
            :socket-provider="provideSocket"
            :models="models"
            :models-loading="modelsLoading"
            :connection-state="connectionState"
            @refresh-models="fetchModels"
            @model-selected="handleModelSelected"
          />
          <DebugPanel
            v-else-if="activeTab === 'debug'"
            :results="debugResults"
            :selected-result="selectedDebugResult"
            @clear="
              debugResults = [];
              lastSeenDebugCount = 0;
              debugLogCount = 0;
              selectedDebugResult = null;
            "
            @select="selectedDebugResult = $event"
          />
        </div>

        <div v-if="activeTab !== 'debug'" class="h-full">
          <ResultViewer
            :messages="messages"
            :aborting-id="abortingId"
            @clear="messages = []"
            @abort="
              (requestId) =>
                provideSocket.abortJob(requestId).then((success) => {
                  if (!success) console.warn('Failed to abort job:', requestId);
                })
            "
          />
        </div>
        <div
          v-else-if="selectedDebugResult"
          class="bg-elevated border border-divider panel-glow overflow-hidden h-full max-h-[calc(100vh-250px)]"
        >
          <div
            class="px-4 py-3 bg-secondary border-b border-divider flex items-center justify-between"
          >
            <div class="flex items-center gap-2 font-mono">
              <span class="text-brand">&gt;</span>
              <span class="text-xs text-brand uppercase tracking-wider">
                Request Details
              </span>
            </div>
          </div>
          <div class="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-320px)]">
            <div class="flex items-center gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span
                    class="text-[10px] px-1.5 py-0.5 font-mono uppercase"
                    :class="
                      selectedDebugResult.type === 'socket'
                        ? 'border border-warning/50 text-warning bg-warning/10'
                        : 'border border-brand/50 text-brand bg-brand/10'
                    "
                  >
                    {{ selectedDebugResult.type }}
                  </span>
                  <span
                    v-if="selectedDebugResult.direction"
                    class="text-[10px] px-1.5 py-0.5 font-mono uppercase"
                    :class="
                      selectedDebugResult.direction === 'response'
                        ? 'border border-success/50 text-success bg-success/10'
                        : 'border border-warning/50 text-warning bg-warning/10'
                    "
                  >
                    {{ selectedDebugResult.direction }}
                  </span>
                  <span
                    class="text-[10px] px-1.5 py-0.5 font-mono uppercase"
                    :class="
                      selectedDebugResult.status === 'success'
                        ? 'border border-success/50 text-success bg-success/10'
                        : 'border border-error/50 text-error bg-error/10'
                    "
                  >
                    {{ selectedDebugResult.status }}
                  </span>
                  <span
                    class="text-sm font-mono font-semibold"
                    :class="
                      selectedDebugResult.method === 'POST'
                        ? 'text-blue-500'
                        : selectedDebugResult.method === 'GET'
                          ? 'text-green-500'
                          : selectedDebugResult.method === 'CONNECT'
                            ? 'text-green-500'
                            : selectedDebugResult.method === 'DISCONNECT'
                              ? 'text-gray-500'
                              : selectedDebugResult.method === 'CONNECT_ERROR'
                                ? 'text-red-500'
                                : 'text-gray-400'
                    "
                  >
                    {{ selectedDebugResult.method }}
                  </span>
                  <span class="text-sm font-mono text-fg-secondary break-all">
                    {{ selectedDebugResult.endpoint }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-3 text-xs font-mono text-fg-muted mt-1"
                >
                  <span>{{ selectedDebugResult.timestamp }}</span>
                  <span v-if="selectedDebugResult.responseTime > 0"
                    >{{ selectedDebugResult.responseTime }}ms</span
                  >
                  <span
                    v-if="selectedDebugResult.statusCode"
                    :class="
                      selectedDebugResult.statusCode >= 200 &&
                      selectedDebugResult.statusCode < 300
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                  >
                    {{ selectedDebugResult.statusCode }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <div
                v-if="selectedDebugResult.requestId"
                class="flex items-center bg-secondary rounded-none overflow-hidden relative"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-brand/30 via-brand/10 to-transparent"
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 text-fg-secondary relative"
                  >Request ID</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 text-fg-primary relative"
                  >{{ selectedDebugResult.requestId }}</span
                >
              </div>
              <div
                v-if="selectedDebugResult.roomId"
                class="flex items-center bg-secondary rounded-none overflow-hidden relative"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-info/30 via-info/10 to-transparent"
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 text-fg-secondary relative"
                  >Room ID</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 text-fg-primary relative"
                  >{{ selectedDebugResult.roomId }}</span
                >
              </div>
              <div
                v-if="selectedDebugResult.event"
                class="flex items-center bg-secondary rounded-none overflow-hidden relative"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-warning/30 via-warning/10 to-transparent"
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 text-fg-secondary relative"
                  >Event</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 text-fg-primary relative"
                  >{{ selectedDebugResult.event }}</span
                >
              </div>
              <div
                v-if="selectedDebugResult.numCtx"
                class="flex items-center bg-secondary rounded-none overflow-hidden relative"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-success/30 via-success/10 to-transparent"
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 text-fg-secondary relative"
                  >Num Ctx</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 text-fg-primary relative"
                  >{{ selectedDebugResult.numCtx }}</span
                >
              </div>
              <div
                v-if="selectedDebugResult.stream !== undefined"
                class="flex items-center bg-secondary rounded-none overflow-hidden relative"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-brand/30 via-brand/10 to-transparent"
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 text-fg-secondary relative"
                  >Stream</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 text-fg-primary relative"
                  >{{ selectedDebugResult.stream }}</span
                >
              </div>
              <div
                v-if="selectedDebugResult.model"
                class="flex items-center bg-secondary rounded-none overflow-hidden relative"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-brand/30 via-brand/10 to-transparent"
                ></div>
                <span
                  class="text-[10px] font-mono font-bold uppercase px-2 py-1 text-fg-secondary relative"
                  >Model</span
                >
                <span
                  class="text-[10px] font-mono px-2 py-1 text-fg-primary relative"
                  >{{ selectedDebugResult.model }}</span
                >
              </div>
            </div>

            <div v-if="selectedDebugResult.requestHeaders" class="space-y-1">
              <span class="text-xs font-mono text-gray-400 uppercase"
                >Request Headers</span
              >
              <pre
                class="text-xs font-mono text-gray-300 whitespace-pre-wrap break-word bg-secondary p-2 rounded"
                >{{
                  JSON.stringify(selectedDebugResult.requestHeaders, null, 2)
                }}</pre
              >
            </div>

            <div v-if="selectedDebugResult.requestBody" class="space-y-1">
              <span class="text-xs font-mono text-gray-400 uppercase"
                >Request Body</span
              >
              <pre
                class="text-xs font-mono text-gray-300 whitespace-pre-wrap break-word bg-secondary p-2 rounded"
                >{{ selectedDebugResult.requestBody }}</pre
              >
            </div>

            <div v-if="selectedDebugResult.prompt" class="space-y-1">
              <span class="text-xs font-mono text-gray-400 uppercase"
                >Prompt</span
              >
              <pre
                class="text-xs font-mono text-gray-300 whitespace-pre-wrap break-word bg-secondary p-2 rounded"
                >{{ selectedDebugResult.prompt }}</pre
              >
            </div>

            <div v-if="selectedDebugResult.responseBody" class="space-y-1">
              <span class="text-xs font-mono text-gray-400 uppercase"
                >Response</span
              >
              <pre
                class="text-xs font-mono text-gray-300 whitespace-pre-wrap break-word bg-secondary p-2 rounded"
                >{{ selectedDebugResult.responseBody }}</pre
              >
            </div>

            <div
              v-if="
                selectedDebugResult.status === 'error' &&
                selectedDebugResult.errorMessage
              "
              class="space-y-1"
            >
              <span class="text-xs font-mono text-red-400 uppercase"
                >Error</span
              >
              <pre
                class="text-xs font-mono text-red-400 whitespace-pre-wrap break-word bg-red-500/10 p-2 rounded"
                >{{ selectedDebugResult.errorMessage }}</pre
              >
            </div>
          </div>
        </div>
        <div
          v-else
          class="bg-elevated border border-divider overflow-hidden h-full max-h-[calc(100vh-250px)]"
        >
          <div
            class="flex flex-col items-center justify-center h-full py-12 px-4"
          >
            <div
              class="w-12 h-12 bg-tertiary flex items-center justify-center mb-3"
            >
              <svg
                class="w-6 h-6 text-fg-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-sm text-fg-muted font-mono">Select a debug entry</p>
            <p class="text-xs text-fg-muted/70 mt-1 font-mono">
              Click on a log entry to see details
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-divider bg-secondary"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div
          class="flex items-center justify-between text-xs text-fg-muted font-mono"
        >
          <div class="flex items-center gap-3">
            <span class="text-brand">ckir.io/visions</span>
            <span class="text-border">::</span>
            <span>v1.2.0</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-fg-muted">endpoints:</span>
            <span class="text-brand">/api/v1/vision</span>
            <span class="text-border">,</span>
            <span class="text-brand-muted">/api/v1/mcp</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
