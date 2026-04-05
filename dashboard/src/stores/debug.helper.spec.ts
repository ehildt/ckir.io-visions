import { describe, expect, it, vi } from 'vitest';

import {
  createTrackingPromise,
  formatResponseBody,
  resolveTrackedResponse,
} from './debug.helper';

describe('createTrackingPromise', () => {
  it('wraps promise with startTime', () => {
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(50) });
    const p = Promise.resolve({ ok: true } as Response);
    const tracking = createTrackingPromise(p);
    expect(tracking.promise).toBe(p);
    expect(tracking.startTime).toBe(50);
    vi.unstubAllGlobals();
  });
});

describe('formatResponseBody', () => {
  it('formats valid JSON', async () => {
    const result = await formatResponseBody('{"a":1}');
    expect(result).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('returns raw text for invalid JSON', async () => {
    const result = await formatResponseBody('hello');
    expect(result).toBe('hello');
  });
});

describe('resolveTrackedResponse', () => {
  it('resolves with timing and formatted body', async () => {
    vi.stubGlobal('performance', {
      now: vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(42),
    });
    const res = new Response('{"b":2}', { status: 200 });
    const tracking = createTrackingPromise(Promise.resolve(res));
    const {
      res: resultRes,
      responseTime,
      responseBody,
    } = await resolveTrackedResponse(tracking);
    expect(resultRes.ok).toBe(true);
    expect(responseTime).toBe(42);
    expect(responseBody).toBe(JSON.stringify({ b: 2 }, null, 2));
    vi.unstubAllGlobals();
  });
});
