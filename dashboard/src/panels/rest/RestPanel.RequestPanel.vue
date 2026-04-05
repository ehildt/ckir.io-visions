<script setup lang="ts">
import FileUpload from '../../components/file-upload/FileUpload.vue';
import {
  ModelField,
  NumCtxField,
  PromptField,
  RequestIdField,
  StreamField,
  SubmitButton,
  TaskField,
} from '../../components/inputs';
import RequestPanelHeader from '../../components/panels/RequestPanel.Header.vue';
import type { SocketProvider } from '../../types/socket-provider.model';

defineProps<{
  socketProvider: SocketProvider;
  models: string[];
  modelsLoading: boolean;
  model: string;
  task: string;
  stream: boolean;
  numCtx: string;
  prompt: string;
  requestId: string;
  isAnalyzeDisabled: boolean;
  loading: boolean;
  buttonBlinking?: boolean;
  fileFieldBlinking?: boolean;
  modelFieldBlinking?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:model', value: string): void;
  (e: 'update:task', value: string): void;
  (e: 'update:stream', value: boolean): void;
  (e: 'update:numCtx', value: string): void;
  (e: 'update:prompt', value: string): void;
  (e: 'update:requestId', value: string): void;
  (e: 'refresh-models'): void;
  (e: 'refresh-request-id'): void;
  (e: 'files-change', files: File[]): void;
  (e: 'submit'): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
}>();
</script>

<template>
  <div class="bg-elevated border border-divider panel-glow">
    <RequestPanelHeader endpoint="/api/v1/vision" />

    <div class="p-4 space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <ModelField
          :model-value="model"
          :models="models"
          :models-loading="modelsLoading"
          :blinking="modelFieldBlinking"
          @update:model-value="(value: string) => emit('update:model', value)"
          @refresh-models="emit('refresh-models')"
        />
        <TaskField
          :model-value="task"
          @update:model-value="(value: string) => emit('update:task', value)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <RequestIdField
          :model-value="requestId"
          @update:model-value="
            (value: string) => emit('update:requestId', value)
          "
          @refresh="emit('refresh-request-id')"
        />
        <StreamField
          :model-value="stream"
          @update:model-value="(value: boolean) => emit('update:stream', value)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <FileUpload
          :blinking="fileFieldBlinking"
          @change="(newFiles: File[]) => emit('files-change', newFiles)"
        />
        <NumCtxField
          :model-value="numCtx"
          @update:model-value="(value: string) => emit('update:numCtx', value)"
        />
      </div>

      <PromptField
        :model-value="prompt"
        label="Prompt"
        placeholder="Enter your text here…"
        @update:model-value="(value: string) => emit('update:prompt', value)"
      />

      <SubmitButton
        :disabled="isAnalyzeDisabled"
        :loading="loading"
        :blinking="buttonBlinking"
        @click="emit('submit')"
        @mouseenter="emit('mouseenter')"
        @mouseleave="emit('mouseleave')"
      />
    </div>
  </div>
</template>
