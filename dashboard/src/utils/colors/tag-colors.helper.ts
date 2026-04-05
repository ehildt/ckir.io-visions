export function getTypeColors(type: string) {
  return type === 'socket'
    ? {
        border: 'border-warning/50',
        text: 'text-warning',
        bg: 'bg-warning/10',
      }
    : {
        border: 'border-accent-primary/50',
        text: 'text-accent-primary',
        bg: 'bg-accent-primary/10',
      };
}

export function getDirectionColors(direction: string) {
  return direction === 'response'
    ? {
        border: 'border-tab-rest/50',
        text: 'text-tab-rest',
        bg: 'bg-tab-rest/10',
      }
    : {
        border: 'border-tab-mcp/50',
        text: 'text-tab-mcp',
        bg: 'bg-tab-mcp/10',
      };
}

export function getTagColorClasses(
  variant: 'type' | 'direction' | 'status',
  value: string,
): { border: string; text: string; bg: string } {
  switch (variant) {
    case 'type':
      return value === 'socket'
        ? {
            border: 'border-tab-rest/50',
            text: 'text-tab-rest',
            bg: 'bg-tab-rest/10',
          }
        : {
            border: 'border-tab-mcp/50',
            text: 'text-tab-mcp',
            bg: 'bg-tab-mcp/10',
          };
    case 'direction':
      return value === 'response'
        ? {
            border: 'border-tab-rest/50',
            text: 'text-tab-rest',
            bg: 'bg-tab-rest/10',
          }
        : {
            border: 'border-tab-mcp/50',
            text: 'text-tab-mcp',
            bg: 'bg-tab-mcp/10',
          };
    case 'status':
      return value === 'success'
        ? {
            border: 'border-tab-rest/50',
            text: 'text-tab-rest',
            bg: 'bg-tab-rest/10',
          }
        : {
            border: 'border-tab-debug/50',
            text: 'text-tab-debug',
            bg: 'bg-tab-debug/10',
          };
    default:
      return {
        border: 'border-tab-debug/50',
        text: 'text-tab-debug',
        bg: 'bg-tab-debug/10',
      };
  }
}
