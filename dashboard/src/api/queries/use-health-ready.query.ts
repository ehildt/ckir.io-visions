import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

import type { HealthResponse } from './use-health-ready.query.type.ts';

export default function useHealthReady(): UseQueryReturnType<HealthResponse, Error> {
  return useQuery<HealthResponse, Error>({
    queryKey: ['health', 'ready'],
    queryFn: async () => {
      const res = await fetch('/api/v1/health/ready');
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<HealthResponse>;
    },
  });
}
