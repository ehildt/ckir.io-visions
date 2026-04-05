export type VisionTask = 'describe' | 'compare' | 'ocr';

export interface Prompt {
  role: 'user' | 'system';
  content: string;
}

export interface McpRequestParamsArguments {
  prompt?: Prompt[];
  task?: VisionTask;
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
  requestId: string;
  vLLM: string;
  method: string;
  params: McpRequestParams;
}
