import type { Ref } from 'vue';

export interface FormQueryOptions {
  requestId: Ref<string>;
  roomId: Ref<string>;
  stream: Ref<boolean>;
  event: Ref<string>;
  numCtx: Ref<string>;
}

export interface FormExtras {
  task?: string;
  prompt?: string;
}

export function buildHeaders(model: string): Record<string, string> {
  return {
    'x-vision-llm': model,
    accept: 'application/json',
  };
}

export function buildQueryParams(options: FormQueryOptions): URLSearchParams {
  const params = new URLSearchParams();
  params.append('requestId', options.requestId.value);
  if (options.roomId.value) params.append('roomId', options.roomId.value);
  params.append('stream', options.stream.value ? 'true' : 'false');
  params.append('event', options.event.value.trim() || 'vision');
  if (options.numCtx.value) params.append('numCtx', options.numCtx.value);
  return params;
}

export function buildFormData(files: File[], extras?: FormExtras): FormData {
  const formData = new FormData();
  if (extras?.task) formData.append('task', extras.task);
  for (const file of files) formData.append('images', file, file.name);
  if (extras?.prompt) formData.append('prompt', extras.prompt);
  return formData;
}

export async function fileToBase64(
  file: File,
): Promise<{ data: string; mimeType: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({
        data: base64,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function extractPrompt(formData?: FormData): string | undefined {
  if (!formData) return undefined;

  const promptValue = formData.get('prompt');
  if (promptValue && typeof promptValue === 'string') return promptValue;

  const payloadValue = formData.get('payload');
  if (payloadValue && typeof payloadValue === 'string') {
    try {
      const payload = JSON.parse(payloadValue);
      if (payload.params?.arguments?.prompt)
        return JSON.stringify(payload.params.arguments.prompt);
    } catch {
      // Ignore parse errors
    }
  }

  return undefined;
}
