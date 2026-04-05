export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'text-method-get';
    case 'POST':
      return 'text-method-post';
    case 'PUT':
      return 'text-method-put';
    case 'DELETE':
      return 'text-method-delete';
    case 'PATCH':
      return 'text-method-patch';
    case 'CONNECT':
    case 'DISCONNECT':
    case 'CONNECT_ERROR':
      return 'text-method-system';
    default:
      return 'text-method-default';
  }
}

export function getMethodTabColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'text-tab-rest'; // Primary
    case 'POST':
      return 'text-tab-mcp'; // Secondary
    case 'PUT':
      return 'text-tab-debug'; // Tertiary
    case 'DELETE':
      return 'text-tab-rest'; // Primary (important action)
    case 'PATCH':
      return 'text-tab-mcp'; // Secondary
    default:
      return 'text-tab-debug'; // Tertiary
  }
}

export function getMethodTabBorderColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'border-tab-rest/50';
    case 'POST':
      return 'border-tab-mcp/50';
    case 'PUT':
      return 'border-tab-debug/50';
    case 'DELETE':
      return 'border-tab-rest/50';
    case 'PATCH':
      return 'border-tab-mcp/50';
    default:
      return 'border-tab-debug/50';
  }
}
