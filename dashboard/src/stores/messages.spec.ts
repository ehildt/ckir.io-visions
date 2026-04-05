import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useMcpMessagesStore, useRestMessagesStore } from './messages';

describe('useRestMessagesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with empty messages', () => {
    const store = useRestMessagesStore();
    expect(store.messages).toEqual([]);
    expect(store.completedCount).toBe(0);
  });

  it('addPendingMessage creates a pending message', () => {
    const store = useRestMessagesStore();
    store.addPendingMessage('vision', 'room-1', 'req-1', 'describe', true);
    expect(store.messages).toHaveLength(1);
    expect(store.messages[0].data.pending).toBe(true);
    expect(store.messages[0].data.requestId).toBe('req-1');
    expect(store.messages[0].data.event).toBe('vision');
  });

  it('addMessage appends message when tracked', () => {
    const store = useRestMessagesStore();
    store.addPendingMessage('vision', 'room-1', 'req-1');
    store.addMessage('vision', {
      requestId: 'req-1',
      done: true,
      message: { content: 'result' },
    });
    expect(store.messages).toHaveLength(1);
    expect(store.messages[0].data.done).toBe(true);
    expect(store.messages[0].data.message?.content).toBe('result');
  });

  it('addMessage ignores canceled messages', () => {
    const store = useRestMessagesStore();
    store.addMessage('vision', { canceled: true });
    expect(store.messages).toHaveLength(0);
  });

  it('addMessage ignores untracked requestIds', () => {
    const store = useRestMessagesStore();
    store.addMessage('vision', {
      requestId: 'unknown',
      message: { content: 'x' },
    });
    expect(store.messages).toHaveLength(0);
  });

  it('removeMessage deletes by requestId', () => {
    const store = useRestMessagesStore();
    store.addPendingMessage('vision', 'room-1', 'req-1');
    store.removeMessage('req-1');
    expect(store.messages).toHaveLength(0);
  });

  it('updatePendingMessage updates existing pending', () => {
    const store = useRestMessagesStore();
    store.addPendingMessage('vision', 'room-1', 'req-1');
    store.updatePendingMessage('req-1', {
      event: 'vision',
      done: true,
      sessionId: 's1',
    });
    expect(store.messages[0].data.sessionId).toBe('s1');
    expect(store.messages[0].data.done).toBe(true);
    // pending is cleared by the update logic via object spread
    expect(store.messages[0].data.pending).toBe(false);
  });

  it('clearMessages removes everything', () => {
    const store = useRestMessagesStore();
    store.addPendingMessage('vision', 'room-1', 'req-1');
    store.clearMessages();
    expect(store.messages).toHaveLength(0);
    expect(store.completedCount).toBe(0);
  });
});

describe('useMcpMessagesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes independently', () => {
    const mcp = useMcpMessagesStore();
    expect(mcp.messages).toEqual([]);
  });

  it('tracks its own messages', () => {
    const mcp = useMcpMessagesStore();
    mcp.addPendingMessage('mcp-vision', 'room-a', 'mcp-req-1');
    mcp.addMessage('mcp-vision', { requestId: 'mcp-req-1', done: true });
    expect(mcp.messages).toHaveLength(1);
    expect(mcp.messages[0].data.done).toBe(true);
  });
});
