export function getEventColor(event: string): string {
  if (event.includes('error') || event.includes('Error')) return 'text-event';
  if (event.includes('connect')) return 'text-event';
  if (event.includes('abort')) return 'text-loading-secondary';
  return 'text-event';
}

export function getRoomColor(): string {
  return 'text-room';
}

export function getLoadingColor(): string {
  return 'text-loading';
}

export function getLoadingSecondaryColor(): string {
  return 'text-loading-secondary';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'border-accent-primary text-accent-primary';
    case 'aborting':
      return 'border-error text-error';
    case 'aborted':
      return 'text-error';
    default:
      return '';
  }
}
