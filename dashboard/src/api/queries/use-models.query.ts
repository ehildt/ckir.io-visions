import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query';

import { getApiUrl } from '../api-url';
import type { ModelsResponse } from './use-models.query.type.ts';

export default function useModels(): UseQueryReturnType<ModelsResponse, Error> {
  return useQuery<ModelsResponse, Error>({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await fetch(getApiUrl('/api/v1/vision/models'));
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<ModelsResponse>;
    },
  });
}
