export interface TrackRequestDetails {
  headers?: Record<string, string>;
  body?: string;
  formData?: FormData;
  requestId?: string;
  roomId?: string;
  event?: string;
  numCtx?: string;
  stream?: boolean;
  model?: string;
}

export interface SocketProvider {
  getSocket: (event?: string, room?: string) => any;
  joinRoom?: (roomId: string, eventName: string) => void;
  leaveRoom?: (roomId: string, eventName: string) => void;
  listenToEvent?: (eventName: string) => void;
  stopListening?: () => void;
  trackRequest: (
    endpoint: string,
    method: string,
    promise: Promise<Response>,
    details?: TrackRequestDetails,
  ) => Promise<Response>;
  addMessage: (event: string, data: unknown) => void;
  addPendingMessage: (
    event: string,
    roomId: string,
    requestId: string,
    task?: string,
    stream?: boolean,
  ) => void;
  updatePendingMessage: (requestId: string, data: unknown) => void;
  connectedEvents: { value: Set<string> };
  connectedRooms: { value: Map<string, Set<string>> };
  getConnectedEventsAndRooms: () => string[];
  closeEvent: (eventName: string) => void;
  closeRoom: (eventName: string, roomId: string) => void;
}
