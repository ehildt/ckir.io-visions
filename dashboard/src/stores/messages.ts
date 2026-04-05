import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Message, MessageData } from '../types/message.model';

export type { Message, MessageData };

function createMessagesStore(name: string) {
  return defineStore(name, () => {
    const messages = ref<Message[]>([]);
    const trackedRequestIds = ref<Set<string>>(new Set());

    function trackRequest(requestId: string) {
      trackedRequestIds.value.add(requestId);
    }

    function addMessage(event: string, data: unknown) {
      const d = data as MessageData;
      const requestId = d?.requestId || d?.meta?.[0]?.requestId;

      if (d?.canceled || d?.status === 'canceled') {
        return;
      }

      if (requestId && !trackedRequestIds.value.has(requestId)) {
        return;
      }

      if (requestId) {
        const existingIndex = messages.value.findIndex(
          (m) =>
            m.data.requestId === requestId ||
            m.data.meta?.[0]?.requestId === requestId,
        );

        if (existingIndex !== -1) {
          const existing = messages.value[existingIndex];
          const existingContent = existing.data.message?.content;
          const newContent = d.message?.content;

          const updatedData: MessageData = {
            ...existing.data,
            message: newContent
              ? { content: (existingContent || '') + newContent }
              : existing.data.message,
            pending: newContent ? undefined : existing.data.pending,
            done: d.done === true ? true : existing.data.done,
            sessionId: d.sessionId || existing.data.sessionId,
          };
          messages.value.splice(existingIndex, 1, {
            ...existing,
            data: updatedData,
          });
          return;
        }
      }

      messages.value = [
        {
          time: new Date().toLocaleTimeString(),
          event,
          data: d as MessageData,
        },
        ...messages.value,
      ];
    }

    function addPendingMessage(
      event: string,
      roomId: string,
      requestId: string,
      task?: string,
      stream?: boolean,
    ) {
      trackedRequestIds.value.add(requestId);

      messages.value = [
        {
          time: new Date().toLocaleTimeString(),
          event,
          data: {
            pending: true,
            requestId,
            event,
            roomId: roomId || undefined,
            task: task || undefined,
            stream: stream ?? undefined,
          },
        },
        ...messages.value,
      ];
    }

    function updatePendingMessage(requestId: string, data: unknown) {
      const d = data as MessageData;
      const msg = messages.value.find(
        (m) => m.event === d?.event && m.data.requestId === requestId,
      );
      if (msg && msg.data.pending) {
        msg.data = { ...msg.data, ...d, pending: false };
      }
    }

    function removeMessage(requestId: string) {
      const index = messages.value.findIndex(
        (m) => m.data.requestId === requestId,
      );
      if (index !== -1) {
        messages.value.splice(index, 1);
      }
      trackedRequestIds.value.delete(requestId);
    }

    function clearMessages() {
      messages.value = [];
      trackedRequestIds.value.clear();
    }

    const completedCount = computed(
      () => messages.value.filter((m) => !m.data.pending).length,
    );

    return {
      messages,
      completedCount,
      addMessage,
      addPendingMessage,
      updatePendingMessage,
      removeMessage,
      clearMessages,
      trackRequest,
    };
  });
}

export const useRestMessagesStore = createMessagesStore('restMessages');
export const useMcpMessagesStore = createMessagesStore('mcpMessages');
