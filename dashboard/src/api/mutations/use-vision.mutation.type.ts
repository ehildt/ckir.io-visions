export interface RealtimeInfo {
  event: string;
  roomId?: string;
  requestId: string;
}

export interface VisionResponse {
  realtime: RealtimeInfo;
}

export interface VisionVariables {
  requestId: string;
  vLLM: string;
  formData: FormData;
}
