export type VisionTask = 'describe' | 'compare' | 'ocr';

export interface Prompt {
  role: 'user' | 'system';
  content: string;
}

export interface McpImageData {
  data: string;
  mimeType?: string;
  name?: string;
}

export interface McpPreprocessingSettings {
  enabled?: boolean;
  resize?: {
    maxWidth?: number;
    maxHeight?: number | null;
    withoutEnlargement?: boolean;
  };
  variants?: {
    original?: boolean;
    grayscale?: boolean;
    denoised?: boolean;
    sharpened?: boolean;
    clahe?: boolean;
  };
  parameters?: Record<string, number | undefined>;
}

export interface McpRequestParamsArguments {
  requestId: string;
  roomId?: string;
  stream?: boolean;
  event?: string;
  numCtx?: number;
  model: string;
  prompt?: Prompt[];
  task?: VisionTask;
  images?: McpImageData[];
  preprocessing?: McpPreprocessingSettings;
}

export interface McpRequestParams {
  name?: 'visions.analyze';
  arguments: McpRequestParamsArguments;
}

export interface McpRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: McpRequestParams;
}

export interface McpTextContent {
  type: 'text';
  text: string;
}

export interface RealtimeInfo {
  event: string;
  roomId?: string;
  requestId: string;
}

export interface McpToolsCallResult {
  content: McpTextContent[];
  isError: boolean;
  realtime: RealtimeInfo;
}

export interface McpResponse {
  id: number;
  jsonrpc: '2.0';
  result: McpToolsCallResult;
}

export interface McpVariables {
  method: string;
  params: McpRequestParams;
}
