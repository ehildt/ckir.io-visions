import { useMutation, type UseMutationReturnType } from '@tanstack/vue-query';

import { getApiUrl } from '../api-url';
import type {
  CancelJobResponse,
  CancelJobVariables,
} from './use-cancel-vision.mutation.type.ts';

export default function useCancelVisionMutation(): UseMutationReturnType<
  CancelJobResponse,
  Error,
  CancelJobVariables,
  unknown
> {
  return useMutation({
    mutationKey: ['vision', 'cancel'],
    mutationFn: async ({ requestId }) => {
      const res = await fetch(getApiUrl('/api/v1/vision/cancel'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<CancelJobResponse>;
    },
  });
}
