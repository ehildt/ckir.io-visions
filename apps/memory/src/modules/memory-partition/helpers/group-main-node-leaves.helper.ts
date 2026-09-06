import { createHash } from 'node:crypto';

import type { MemoryClusterLane } from '../../qdrant/constants/cluster.constant.js';
import { BRIDGE_TAG } from '../../qdrant/constants/conviction.constant.js';

/** Group key for partition facts that carry no subject/tag. */
const UNTAGGED_CLUSTER = 'untagged';
/** Group key collecting the synthesized bridge records (gap-closers). */
const BRIDGE_CLUSTER = 'bridges';
/** Group key for encyclopedia chunks with no topic/title/domain. */
const UNKNOWN_DOMAIN = 'unknown';

/**
 * One leaf point as far as main-node grouping is concerned: the union of the
 * fields the two lanes' scrollers return (partition adds subject; the
 * encyclopedia adds topic/title/domain/originalHash over its chunks).
 */
interface MainNodeLeafPoint {
  id: string;
  text: string;
  /** Partition hub tier: the singular entity the fact is about. */
  subject?: string;
  tags: string[];
  /** Encyclopedia hub tier (document topic, written by classify). */
  topic?: string;
  /** Encyclopedia document title (uploaded files). */
  title?: string;
  /** Encyclopedia source domain. */
  domain?: string;
  /** Set on uploaded documents — flags the title fallback as file-named. */
  originalHash?: string;
}

/** One main-node group: a topic blob's leaf set, with the drift signal. */
interface MainNodeGroup {
  /** Deterministic row id — sha256 of scopeSeed + group key. */
  id: string;
  /** The blob key — mirrors the dashboard's per-space topic grouping. */
  key: string;
  /** The tier's human title (the group key itself). */
  title: string;
  memberIds: string[];
  memberCount: number;
  /** Hash of sorted member id + text-hash pairs — text edits re-summarize. */
  fingerprint: string;
}

/**
 * Group a scope's leaf points into their title-tier main nodes — the exact
 * grouping the constellation draws as topic blobs:
 * - partition: `bridges` for synthesized gap-closers, else the fact's
 *   subject (hub tier), else its first tag, else `untagged`.
 * - encyclopedia: the chunk's topic (hub tier), else the uploaded
 *   document's title, else its source domain, else `unknown`.
 *
 * Single-member groups are skipped — a lone leaf renders directly (there is
 * no blob to summarize, and its summary would just echo the one chunk).
 * Deterministic: members sort by id, groups by key, row ids hash
 * `scopeSeed|key` (a group keeps its identity across content drift), and the
 * fingerprint hashes sorted `${id}:${textHash}` pairs so an in-place point
 * overwrite re-summarizes the group even though its membership is unchanged.
 */
export function groupMainNodeLeaves(
  scopeSeed: string,
  lane: MemoryClusterLane,
  points: readonly MainNodeLeafPoint[],
): MainNodeGroup[] {
  const byKey = new Map<string, MainNodeLeafPoint[]>();
  for (const point of points) {
    const key = groupKeyFor(lane, point);
    const group = byKey.get(key) ?? [];
    group.push(point);
    byKey.set(key, group);
  }
  return [...byKey.entries()]
    .filter(([, members]) => members.length >= 2)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, members]) => {
      const byId = [...members].sort((a, b) => a.id.localeCompare(b.id));
      return {
        id: createHash('sha256').update(`${scopeSeed}|${key}`).digest('hex'),
        key,
        title: key,
        memberIds: byId.map((member) => member.id),
        memberCount: members.length,
        fingerprint: createHash('sha256')
          .update(
            byId
              .map((member) => `${member.id}:${textHash(member.text)}`)
              .join('\n'),
          )
          .digest('hex'),
      };
    });
}

/** One leaf's blob key for the given lane (the dashboard grouping mirrored). */
function groupKeyFor(
  lane: MemoryClusterLane,
  point: MainNodeLeafPoint,
): string {
  if (lane === 'partition') {
    if (point.tags.includes(BRIDGE_TAG)) return BRIDGE_CLUSTER;
    return (
      point.subject?.trim() ||
      point.tags.find((tag) => tag.trim())?.trim() ||
      UNTAGGED_CLUSTER
    );
  }
  return (
    point.topic?.trim() ||
    (point.originalHash ? point.title?.trim() : '') ||
    point.domain ||
    UNKNOWN_DOMAIN
  );
}

/** Short content hash of one leaf text — the fingerprint's edit signal. */
function textHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}
