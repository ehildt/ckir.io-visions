import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useEventLog } from './use-event-log';

describe('useEventLog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns getEventColor helper', () => {
    const log = useEventLog();
    expect(log.getEventColor('error')).toBe('text-event');
  });

  it('returns formatJson helper', () => {
    const log = useEventLog();
    expect(log.formatJson({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('isComplete true when not pending/aborted/aborting', () => {
    const log = useEventLog();
    expect(log.isComplete({ done: true })).toBe(true);
  });

  it('getStatus returns pending', () => {
    const log = useEventLog();
    expect(log.getStatus({ pending: true })).toBe('pending');
  });

  it('getStatus returns aborted', () => {
    const log = useEventLog();
    expect(log.getStatus({ aborted: true })).toBe('aborted');
  });
});
