import { describe, expect, it, vi } from 'vitest';

import { handleResponse } from './use-response-handler';

const mockToast = {
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

describe('handleResponse', () => {
  it('shows error when response is not ok', async () => {
    const res = {
      ok: false,
      status: 404,
      text: () => Promise.resolve('not found'),
    } as any;
    handleResponse(res, null, mockToast);
    await new Promise((r) => setTimeout(r, 10));
    expect(mockToast.error).toHaveBeenCalledWith('404: not found');
  });

  it('shows info when response ok and socket connected', () => {
    const res = { ok: true } as any;
    const socket = { connected: true } as any;
    handleResponse(res, socket, mockToast);
    expect(mockToast.info).toHaveBeenCalledWith('Request sent successfully');
  });

  it('shows warning when response ok but socket disconnected', () => {
    const res = { ok: true } as any;
    const socket = { connected: false } as any;
    handleResponse(res, socket, mockToast);
    expect(mockToast.warning).toHaveBeenCalledWith(
      'Request sent but socket disconnected',
    );
  });

  it('shows warning when response ok but socket is null', () => {
    const res = { ok: true } as any;
    handleResponse(res, null, mockToast);
    expect(mockToast.warning).toHaveBeenCalledWith(
      'Request sent but socket disconnected',
    );
  });
});
