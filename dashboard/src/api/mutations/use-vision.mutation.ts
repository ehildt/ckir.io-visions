import { useMutation, type UseMutationReturnType } from '@tanstack/vue-query';

import { getApiUrl } from '../api-url';
import type {
  VisionResponse,
  VisionVariables,
} from './use-vision.mutation.type.ts';

export default function useVisionMutation(): UseMutationReturnType<
  VisionResponse,
  Error,
  VisionVariables,
  unknown
> {
  return useMutation({
    mutationKey: ['vision'],
    mutationFn: async ({ requestId, vLLM, formData }) => {
      const url = getApiUrl(
        `/api/v1/vision?requestId=${encodeURIComponent(requestId)}`,
      );
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-vision-llm': vLLM,
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<VisionResponse>;
    },
  });
}
