export function getStatusCodeColor(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return 'text-status-code-success';
  if (statusCode >= 400) return 'text-status-code-error';
  return 'text-status-code-default';
}

export function getStatusCodeTabColor(code?: number): string {
  if (!code) return 'text-fg-muted';
  if (code >= 200 && code < 300) return 'text-tab-rest'; // Success - Primary
  if (code >= 400 && code < 500) return 'text-tab-mcp'; // Client error - Secondary
  if (code >= 500) return 'text-tab-debug'; // Server error - Tertiary
  return 'text-tab-mcp'; // Default - Secondary
}

export function getStatusColors(status: 'success' | 'error') {
  return {
    bg: status === 'success' ? 'bg-status-success/5' : 'bg-status-error/5',
    indicatorBg:
      status === 'success' ? 'bg-status-success/20' : 'bg-status-error/20',
    text: status === 'success' ? 'text-status-success' : 'text-status-error',
    border:
      status === 'success'
        ? 'border-status-success/50'
        : 'border-status-error/50',
    indicatorText:
      status === 'success' ? 'text-status-success' : 'text-status-error',
  };
}

export function getConnectionStateColors(
  state: 'connected' | 'disconnected' | 'error',
) {
  switch (state) {
    case 'connected':
      return { text: 'text-connection-connected' };
    case 'disconnected':
      return { text: 'text-connection-disconnected' };
    case 'error':
      return { text: 'text-connection-error' };
    default:
      return { text: 'text-connection-default' };
  }
}
