import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

import { getApiUrl } from '../api-url';
import type { HealthResponse } from './use-health-live.query.type.ts';

export default function useHealthLive(): UseQueryReturnType<
  HealthResponse,
  Error
> {
  return useQuery<HealthResponse, Error>({
    queryKey: ['health', 'live'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/v1/health/live'));
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<HealthResponse>;
    },
  });
}
