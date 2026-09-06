import type { Job } from 'bullmq';

/**
 * Human identifier for a vectorize-queue job, derived from its payload. The
 * BullMQ job id is numeric (and is lost when a DLQ reinstatement re-adds the
 * job), so the log line needs the payload's own scope to say WHAT ran:
 * maintenance jobs carry `lane`/`scopeKey` (e.g. `encyclopedia/global`),
 * fact/cognition jobs carry their space key.
 */
export function describeVectorizeJob(job: Job): string | undefined {
  const data = job.data as Record<string, unknown> | undefined;
  if (!data) return undefined;
  const lane = typeof data.lane === 'string' ? data.lane : undefined;
  const scopeKey =
    typeof data.scopeKey === 'string' ? data.scopeKey : undefined;
  if (lane && scopeKey) return `${lane}/${scopeKey}`;
  return (
    (typeof data.memoryPartition === 'string' && data.memoryPartition) ||
    (typeof data.memoryCognition === 'string' && data.memoryCognition) ||
    (typeof data.sessionId === 'string' && data.sessionId) ||
    undefined
  );
}
