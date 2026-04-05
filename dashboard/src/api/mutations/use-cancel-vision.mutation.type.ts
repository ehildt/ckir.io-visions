export interface CancelJobResponse {
  success: boolean;
  message: string;
  requestId: string;
}

export interface CancelJobVariables {
  requestId: string;
}
