import { useMutation, type UseMutationReturnType } from '@tanstack/vue-query';

import type { McpRequest, McpResponse, McpVariables } from './use-mcp.mutation.type.ts';

export default function useMcpMutation(): UseMutationReturnType<
  McpResponse,
  Error,
  McpVariables,
  unknown
> {
  return useMutation({
    mutationKey: ['mcp'],
    mutationFn: async ({ requestId, vLLM, method, params }) => {
      const url = `/api/v1/mcp?requestId=${encodeURIComponent(requestId)}`;
      const body: McpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-vision-llm': vLLM,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<McpResponse>;
    },
  });
}
