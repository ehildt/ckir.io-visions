import { useMutation, type UseMutationReturnType } from '@tanstack/vue-query';

import { getApiUrl } from '../api-url';
import type {
  McpRequest,
  McpResponse,
  McpVariables,
} from './use-mcp.mutation.type.ts';

export default function useMcpMutation(): UseMutationReturnType<
  McpResponse,
  Error,
  McpVariables,
  unknown
> {
  return useMutation({
    mutationKey: ['mcp'],
    mutationFn: async ({ method, params }) => {
      const url = getApiUrl('/api/v1/mcp');
      const body: McpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Network error');
      return res.json() as Promise<McpResponse>;
    },
  });
}
