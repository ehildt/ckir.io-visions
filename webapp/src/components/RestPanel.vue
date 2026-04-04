<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps<{
  socketProvider: {
    getSocket: () => any;
    joinRoom?: (roomId: string) => void;
    trackRequest: (endpoint: string, method: string, promise: Promise<Response>) => Promise<Response>;
    addMessage: (event: string, data: unknown) => void;
  };
}>();

const task = ref("describe");
const model = ref("");
const requestId = ref(`req-${Date.now()}`);
const roomId = ref("");
const stream = ref(false);
const event = ref("vision");
const numCtx = ref("");
const prompt = ref('[{"role": "user", "content": "Describe this image"}]');
const files = ref<File[]>([]);
const loading = ref(false);
const error = ref("");

onMounted(() => {
  // Initialize socket connection
  props.socketProvider.getSocket();
});

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  files.value = Array.from(input.files || []);
}

function removeFile(index: number) {
  files.value.splice(index, 1);
}

async function submit() {
  error.value = "";
  loading.value = true;

  // Validate model is provided
  if (!model.value.trim()) {
    error.value = "Model is required (e.g., llama3.2-vision, ministral-3:14b)";
    loading.value = false;
    return;
  }

  // Ensure socket is connected before sending
  const socket = props.socketProvider.getSocket();
  if (!socket?.connected) {
    console.warn("Socket not connected, waiting...");
    // Wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.log("Socket connected:", socket?.connected);

  const formData = new FormData();
  formData.append("task", task.value);
  
  console.log("Files to upload:", files.value.length);
  for (const file of files.value) {
    console.log("Appending file:", file.name, file.type, file.size);
    formData.append("images", file, file.name);
  }

  if (prompt.value.trim()) {
    try {
      JSON.parse(prompt.value);
      formData.append("prompt", prompt.value);
    } catch {
      error.value = "Invalid JSON in prompt";
      loading.value = false;
      return;
    }
  }

  const params = new URLSearchParams();
  params.append("requestId", requestId.value);
  if (roomId.value) params.append("roomId", roomId.value);
  // Always include stream and event to match curl behavior
  params.append("stream", stream.value ? "true" : "false");
  params.append("event", event.value || "vision");
  if (numCtx.value) params.append("numCtx", numCtx.value);

  // Log FormData contents
  console.log("FormData entries:");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size})`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  // Join room if specified (required to receive room-specific events)
  if (roomId.value && props.socketProvider.joinRoom) {
    props.socketProvider.joinRoom(roomId.value);
  }

  try {
    const fetchPromise = fetch(`/api/v1/vision?${params.toString()}`, {
      method: "POST",
      headers: { 
        "x-vision-llm": model.value,
        "accept": "application/json",
      },
      body: formData,
    });

    // Track the request for debug panel
    props.socketProvider.trackRequest(`/api/v1/vision`, "POST", fetchPromise);

    const res = await fetchPromise;
    const text = await res.text();
    console.log("Response:", res.status, text);

    if (!res.ok) {
      error.value = `${res.status}: ${text}`;
    }
  } catch (e: unknown) {
    console.error("Request failed:", e);
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="bg-[var(--color-bg-panel)] rounded-lg border border-[var(--color-border)] overflow-hidden">
    <!-- Panel Header -->
    <div class="px-4 py-3 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
      <div class="flex items-center gap-2">
        <span class="text-[var(--color-accent-primary)] font-mono text-sm">POST</span>
        <span class="text-[var(--color-text-secondary)] font-mono text-sm">/api/v1/vision</span>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <!-- Model Input -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
          Model (x-vision-llm)
        </label>
        <input 
          v-model="model" 
          placeholder="llama3.2-vision"
          class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono"
        />
      </div>

      <!-- Task & Request ID Row -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            Task
          </label>
          <select 
            v-model="task"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono appearance-none cursor-pointer"
          >
            <option value="describe">describe</option>
            <option value="compare">compare</option>
            <option value="ocr">ocr</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            Request ID
          </label>
          <input 
            v-model="requestId"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono"
          />
        </div>
      </div>

      <!-- Room ID & Stream Row -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            Room ID <span class="text-[var(--color-text-muted)]">(optional)</span>
          </label>
          <input 
            v-model="roomId" 
            placeholder="room-123"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            Stream
          </label>
          <select 
            v-model="stream"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono appearance-none cursor-pointer"
          >
            <option :value="false">false</option>
            <option :value="true">true</option>
          </select>
        </div>
      </div>

      <!-- Event & NumCtx Row -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            Event <span class="text-[var(--color-text-muted)]">(optional)</span>
          </label>
          <input 
            v-model="event" 
            placeholder="vision"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
            NumCtx <span class="text-[var(--color-text-muted)]">(optional)</span>
          </label>
          <input 
            v-model="numCtx" 
            placeholder="32000"
            type="number"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono"
          />
        </div>
      </div>

      <!-- Images Upload -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
          Images
        </label>
        <div class="relative">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            @change="handleFileChange"
            class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--color-accent-primary)] file:text-[var(--color-bg-primary)] hover:file:bg-[var(--color-accent-secondary)] file:cursor-pointer file:transition-colors"
          />
        </div>
        
        <!-- File List -->
        <div v-if="files.length" class="flex flex-wrap gap-2 mt-2">
          <div 
            v-for="(file, i) in files" 
            :key="i" 
            class="flex items-center gap-2 px-2 py-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded text-xs font-mono"
          >
            <span class="text-[var(--color-text-secondary)]">{{ file.name }}</span>
            <button 
              @click="removeFile(i)"
              class="px-1.5 py-0.5 text-[var(--color-accent-error)] hover:bg-[var(--color-accent-error)] hover:text-[var(--color-bg-primary)] rounded transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Prompt JSON -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
          Prompt (JSON) <span class="text-[var(--color-text-muted)]">(optional)</span>
        </label>
        <textarea 
          v-model="prompt" 
          rows="3" 
          placeholder='[{"role": "user", "content": "..."}]'
          class="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] transition-all font-mono resize-none"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button 
        @click="submit"
        :disabled="loading || !files.length"
        class="w-full px-4 py-2.5 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] disabled:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed text-[var(--color-bg-primary)] font-medium text-sm rounded-md transition-all duration-200 font-mono"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-[var(--color-bg-primary)] border-t-transparent rounded-full animate-spin"></span>
          Sending...
        </span>
        <span v-else>Send Request</span>
      </button>

      <!-- Error Message -->
      <div 
        v-if="error" 
        class="px-3 py-2 bg-[var(--color-accent-error)]/10 border border-[var(--color-accent-error)]/30 rounded-md"
      >
        <p class="text-sm text-[var(--color-accent-error)] font-mono">{{ error }}</p>
      </div>
    </div>
  </div>
</template>
