import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('socket.io-client', () => {
  const mockSocket = {
    connected: true,
    id: 'socket-123',
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
  };
  return {
    io: vi.fn(() => mockSocket),
  };
});

vi.mock('../../composables/use-toast', () => ({
  useToast: vi.fn(() => ({
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  })),
}));

import { useSocketStore } from './socket';

describe('useSocketStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with disconnected state', () => {
    const store = useSocketStore();
    expect(store.connectionState).toBe('disconnected');
    expect(store.socketId).toBeNull();
    expect(store.socketError).toBeNull();
  });

  it('initSocket creates socket and sets up listeners', () => {
    const store = useSocketStore();
    const socket = store.initSocket();
    expect(socket).toBeDefined();
  });

  it('listenToEvent applies listener when connected', () => {
    const store = useSocketStore();
    store.initSocket();
    store.listenToEvent('vision');
    expect(store.connectedEvents.has('vision')).toBe(true);
  });

  it('joinRoom adds room to connectedRooms', () => {
    const store = useSocketStore();
    store.initSocket();
    store.joinRoom('room1', 'vision');
    expect(store.connectedRooms.get('vision')?.has('room1')).toBe(true);
  });

  it('leaveRoom removes room from connectedRooms', () => {
    const store = useSocketStore();
    store.initSocket();
    store.joinRoom('room1', 'vision');
    store.leaveRoom('room1', 'vision');
    expect(store.connectedRooms.has('vision')).toBe(false);
  });

  it('closeEvent removes event and rooms', () => {
    const store = useSocketStore();
    store.initSocket();
    store.listenToEvent('vision');
    store.joinRoom('room1', 'vision');
    store.closeEvent('vision');
    expect(store.connectedEvents.has('vision')).toBe(false);
    expect(store.connectedRooms.has('vision')).toBe(false);
  });

  it('getConnectedEventsAndRooms returns empty when no events', () => {
    const store = useSocketStore();
    store.initSocket();
    expect(store.getConnectedEventsAndRooms()).toEqual([]);
  });

  it('getConnectedEventsAndRooms returns event with rooms', () => {
    const store = useSocketStore();
    store.initSocket();
    store.joinRoom('room1', 'vision');
    store.listenToEvent('vision');
    const result = store.getConnectedEventsAndRooms();
    expect(result).toEqual(['vision::room1']);
  });

  it('getConnectedEventsAndRooms returns event without rooms', () => {
    const store = useSocketStore();
    store.initSocket();
    store.listenToEvent('vision');
    const result = store.getConnectedEventsAndRooms();
    expect(result).toEqual(['vision']);
  });
});
