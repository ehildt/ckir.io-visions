export function useDebugColors() {
  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-green-500';
      case 'POST':
        return 'text-blue-500';
      case 'PUT':
        return 'text-yellow-500';
      case 'DELETE':
        return 'text-red-500';
      case 'PATCH':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-500';
    if (statusCode >= 400) return 'text-red-500';
    return 'text-gray-500';
  };

  const getStatusColors = (status: 'success' | 'error') => ({
    bg: status === 'success' ? 'bg-green-500/5' : 'bg-red-500/5',
    indicatorBg: status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20',
    text: status === 'success' ? 'text-green-500' : 'text-red-500',
    border: status === 'success' ? 'border-success/50' : 'border-error/50',
    indicatorText: status === 'success' ? 'text-green-500' : 'text-red-500',
  });

  const getTypeColors = (type: string) =>
    type === 'socket'
      ? {
          border: 'border-warning/50',
          text: 'text-warning',
          bg: 'bg-warning/10',
        }
      : { border: 'border-brand/50', text: 'text-brand', bg: 'bg-brand/10' };

  const getDirectionColors = (direction: string) =>
    direction === 'response'
      ? {
          border: 'border-success/50',
          text: 'text-success',
          bg: 'bg-success/10',
        }
      : {
          border: 'border-warning/50',
          text: 'text-warning',
          bg: 'bg-warning/10',
        };

  return {
    getMethodColor,
    getStatusCodeColor,
    getStatusColors,
    getTypeColors,
    getDirectionColors,
  };
}
