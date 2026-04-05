export interface MessageData {
  pending?: boolean;
  done?: boolean;
  requestId?: string;
  event?: string;
  roomId?: string;
  task?: string;
  stream?: boolean;
  message?: {
    content?: string;
  };
  meta?: Array<{ requestId?: string }>;
  aborted?: boolean;
  canceled?: boolean;
  status?: string;
  sessionId?: string;
  source?: 'rest' | 'mcp';
}

export interface Message {
  time: string;
  event: string;
  data: MessageData;
}
