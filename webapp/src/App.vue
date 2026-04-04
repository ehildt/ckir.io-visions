<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { io, Socket } from "socket.io-client";
import RestPanel from "./components/RestPanel.vue";
import McpPanel from "./components/McpPanel.vue";
import ResultViewer from "./components/ResultViewer.vue";
import DebugPanel from "./components/DebugPanel.vue";

const activeTab = ref<"rest" | "mcp" | "debug">("rest");
const messages = ref<Array<{time: string; event: string; data: unknown}>>([]);

// Connection state tracking
const connectionState = ref<"connected" | "disconnected" | "error">("disconnected");
const socketError = ref<string | null>(null);
const lastConnectionEvent = ref<string>("disconnected");

// Debug counter - tracks new logs since last tab visit
const debugLogCount = ref(0);
const lastSeenDebugCount = ref(0);
const debugTabVisited = ref(true);

// Debug results tracking
const debugResults = ref<Array<{
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: "success" | "error";
  statusCode?: number;
  errorMessage?: string;
  responseTime: number;
  type: "http" | "socket";
}>>([]);

let socket: Socket | null = null;

// Watch debug results to count new entries
watch(debugResults, (newResults, oldResults) => {
  if (newResults.length > oldResults.length && !debugTabVisited.value) {
    debugLogCount.value = newResults.length - lastSeenDebugCount.value;
  }
}, { deep: true });

// Watch tab changes to reset counter
watch(activeTab, (newTab) => {
  if (newTab === "debug") {
    debugTabVisited.value = true;
    lastSeenDebugCount.value = debugResults.value.length;
    debugLogCount.value = 0;
  } else {
    debugTabVisited.value = false;
  }
});

function addMessage(event: string, data: unknown) {
  messages.value.unshift({
    time: new Date().toLocaleTimeString(),
    event,
    data,
  });
}

function addDebugResult(result: {
  endpoint: string;
  method: string;
  status: "success" | "error";
  statusCode?: number;
  errorMessage?: string;
  responseTime: number;
  type?: "http" | "socket";
}) {
  debugResults.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    type: result.type || "http",
    ...result,
  });
}

function updateOrAddSocketDebugEntry(result: {
  endpoint: string;
  method: string;
  status: "success" | "error";
  statusCode?: number;
  errorMessage?: string;
  responseTime: number;
  type: "http" | "socket";
}) {
  // Look for existing socket entry
  const existingIndex = debugResults.value.findIndex(
    r => r.type === "socket" && r.endpoint === result.endpoint
  );
  
  if (existingIndex >= 0) {
    // Update existing entry
    debugResults.value[existingIndex] = {
      ...debugResults.value[existingIndex],
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      method: result.method,
      status: result.status,
      errorMessage: result.errorMessage,
    };
    // Move to top
    const entry = debugResults.value.splice(existingIndex, 1)[0];
    debugResults.value.unshift(entry);
  } else {
    // Add new entry
    debugResults.value.unshift({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      ...result,
    });
  }
}

function initSocket() {
  if (socket?.connected) return socket;
  if (socket) socket.disconnect();

  socket = io("/", { 
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    connectionState.value = "connected";
    socketError.value = null;
    // Only add to debug if state changed
    if (lastConnectionEvent.value !== "connected") {
      lastConnectionEvent.value = "connected";
      updateOrAddSocketDebugEntry({
        endpoint: "socket.io",
        method: "CONNECT",
        status: "success",
        responseTime: 0,
        type: "socket",
      });
    }
  });

  socket.on("disconnect", (reason) => {
    connectionState.value = "disconnected";
    // Only add to debug if state changed
    if (lastConnectionEvent.value !== "disconnected") {
      lastConnectionEvent.value = "disconnected";
      updateOrAddSocketDebugEntry({
        endpoint: "socket.io",
        method: "DISCONNECT",
        status: "error",
        errorMessage: `Disconnected: ${reason}`,
        responseTime: 0,
        type: "socket",
      });
    }
  });

  socket.on("connect_error", (err) => {
    connectionState.value = "error";
    socketError.value = err.message;
    // Only add to debug if state changed to error
    if (lastConnectionEvent.value !== "error") {
      lastConnectionEvent.value = "error";
      updateOrAddSocketDebugEntry({
        endpoint: "socket.io",
        method: "CONNECT_ERROR",
        status: "error",
        errorMessage: err.message,
        responseTime: 0,
        type: "socket",
      });
    }
  });

  socket.on("vision", (data) => {
    console.log("Socket.IO vision event received:", data);
    addMessage("vision", data);
  });

  return socket;
}

function joinRoom(roomId: string) {
  if (socket?.connected) {
    socket.emit("join", roomId);
    console.log(`Joined room: ${roomId}`);
  } else {
    console.warn("Cannot join room - socket not connected");
  }
}

function getSocket() {
  return initSocket();
}

function trackRequest(endpoint: string, method: string, promise: Promise<Response>) {
  const startTime = performance.now();
  
  promise
    .then(async (res) => {
      const responseTime = performance.now() - startTime;
      if (res.ok) {
        addDebugResult({
          endpoint,
          method,
          status: "success",
          statusCode: res.status,
          responseTime: Math.round(responseTime),
          type: "http",
        });
      } else {
        const text = await res.text();
        addDebugResult({
          endpoint,
          method,
          status: "error",
          statusCode: res.status,
          errorMessage: text,
          responseTime: Math.round(responseTime),
          type: "http",
        });
      }
      return res;
    })
    .catch((err) => {
      const responseTime = performance.now() - startTime;
      addDebugResult({
        endpoint,
        method,
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err),
        responseTime: Math.round(responseTime),
        type: "http",
      });
      throw err;
    });

  return promise;
}

// Provide functions to child components
const provideSocket = { getSocket, joinRoom, trackRequest, addMessage };
</script>

<template>
  <div class="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans pb-12">
    <!-- Header -->
    <header class="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-[var(--color-accent-primary)] flex items-center justify-center">
              <span class="text-[var(--color-bg-primary)] font-mono font-bold text-sm">V</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-[var(--color-text-inverse)] tracking-tight">
                ckir.io/visions
              </h1>
              <p class="text-xs text-[var(--color-text-muted)] font-mono">AI Vision Testing Console</p>
            </div>
          </div>
          
          <!-- Connection Status -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <span 
              class="w-2 h-2 rounded-full transition-colors duration-300"
              :class="{
                'bg-[var(--color-accent-success)]': connectionState === 'connected',
                'bg-[var(--color-accent-error)]': connectionState === 'error',
                'bg-[var(--color-text-muted)]': connectionState === 'disconnected'
              }"
            ></span>
            <span class="text-xs font-mono text-[var(--color-text-secondary)]">
              <template v-if="connectionState === 'connected'">● connected</template>
              <template v-else-if="connectionState === 'error'">● error</template>
              <template v-else>○ disconnected</template>
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Tab Navigation -->
      <div class="flex gap-1 mb-6 p-1 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] w-fit">
        <button
          @click="activeTab = 'rest'"
          class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 font-mono"
          :class="activeTab === 'rest' 
            ? 'bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'"
        >
          REST API
        </button>
        <button
          @click="activeTab = 'mcp'"
          class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 font-mono"
          :class="activeTab === 'mcp' 
            ? 'bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'"
        >
          MCP / JSON-RPC
        </button>
        <button
          @click="activeTab = 'debug'"
          class="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 font-mono flex items-center gap-2"
          :class="activeTab === 'debug' 
            ? 'bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)]' 
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'"
        >
          Debug
          <!-- Show counter badge when tab is not active and there are new logs -->
          <span 
            v-if="activeTab !== 'debug' && debugLogCount > 0"
            class="px-1.5 py-0.5 text-xs rounded bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] animate-pulse"
          >
            +{{ debugLogCount }}
          </span>
          <!-- Show status badge when tab is active -->
          <span 
            v-else-if="activeTab === 'debug' && debugResults.length > 0 && debugResults[0].type === 'socket'"
            class="px-1.5 py-0.5 text-xs rounded"
            :class="debugResults[0].status === 'success' 
              ? 'bg-[var(--color-accent-success)] text-[var(--color-bg-primary)]' 
              : 'bg-[var(--color-accent-error)] text-[var(--color-bg-primary)]'"
          >
            {{ debugResults[0].status === 'success' ? '✓' : '✗' }}
          </span>
        </button>
      </div>

      <!-- Panel Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-6">
          <RestPanel 
            v-if="activeTab === 'rest'" 
            :socket-provider="provideSocket"
          />
          <McpPanel 
            v-else-if="activeTab === 'mcp'" 
            :socket-provider="provideSocket"
          />
          <DebugPanel 
            v-else 
            :results="debugResults"
            @clear="debugResults = []; lastSeenDebugCount = 0; debugLogCount = 0"
          />
        </div>
        
        <div>
          <ResultViewer :messages="messages" />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div class="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-mono">
          <div class="flex items-center gap-4">
            <span>ckir.io/visions v1.2.0</span>
            <span class="text-[var(--color-border)]">|</span>
            <span :class="{
              'text-[var(--color-accent-success)]': connectionState === 'connected',
              'text-[var(--color-accent-warning)]': connectionState === 'disconnected',
              'text-[var(--color-accent-error)]': connectionState === 'error'
            }">
              {{ connectionState }}
            </span>
          </div>
          <div class="flex items-center gap-4">
            <span>endpoints: /api/v1/vision, /api/v1/mcp</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
