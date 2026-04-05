export interface DebugResult {
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
  responseBody?: string;
  requestId?: string;
  roomId?: string;
  event?: string;
  numCtx?: string;
  stream?: boolean;
  model?: string;
  prompt?: string;
}
