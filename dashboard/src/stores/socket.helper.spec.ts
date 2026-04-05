import { describe, expect, it, vi } from 'vitest';

import { createSocketProvider, makeDebugEntry } from './socket.helper';

describe('makeDebugEntry', () => {
  it('fills defaults for type and responseTime', () => {
    const entry = makeDebugEntry({
      endpoint: '/',
      method: 'GET',
      status: 'success',
    });
    expect(entry.type).toBe('socket');
    expect(entry.responseTime).toBe(0);
    expect(entry.sessionId).toBeUndefined();
  });

  it('preserves provided sessionId and responseTime', () => {
    const entry = makeDebugEntry({
      endpoint: '/',
      method: 'GET',
      status: 'success',
      sessionId: 's1',
      responseTime: 42,
    });
    expect(entry.sessionId).toBe('s1');
    expect(entry.responseTime).toBe(42);
  });
});

describe('createSocketProvider', () => {
  const socketStore = {
    ensureSocketConnection: vi.fn().mockReturnValue({ connected: true }),
    connectedEvents: new Set(['vision']),
    connectedRooms: new Map([['vision', new Set(['room1'])]]),
    getConnectedEventsAndRooms: vi.fn().mockReturnValue(['vision::room1']),
    closeEvent: vi.fn(),
    closeRoom: vi.fn(),
  } as any;

  const debugStore = {
    trackRequest: vi.fn(),
    addSocketDebugEntry: vi.fn(),
  };

  const messageStore = {
    addMessage: vi.fn(),
    addPendingMessage: vi.fn(),
    updatePendingMessage: vi.fn(),
  };

  it('creates provider with mapped functions', () => {
    const provider = createSocketProvider(
      socketStore,
      debugStore,
      messageStore,
    );
    expect(provider.getSocket()).toEqual({ connected: true });
    expect(provider.connectedEvents.has('vision')).toBe(true);
    expect(provider.connectedRooms.get('vision')?.has('room1')).toBe(true);
  });
});
