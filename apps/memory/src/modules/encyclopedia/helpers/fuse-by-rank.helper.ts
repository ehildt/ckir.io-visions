import type { EncyclopediaSelectedChunk } from '@triplef/agent/schemas';

/** Classic RRF constant — dampens how sharply a top rank outweighs a low one. */
const RRF_K = 60;

/**
 * Rank-fuse several score-ordered candidate lists into one ordering
 * (Reciprocal Rank Fusion, k=60): each candidate's fused score is
 * Σ 1/(k + 0-based rank) across every list it appears in, matched by the
 * chunk text. Only rank order crosses lists — so cosine-scored ephemeral
 * chunks and server-fused (RRF/DBSF-scored) Qdrant hits merge honestly,
 * never by incompatible raw scores. Content duplicates merge into one entry
 * (the first occurrence carries the payload).
 */
export function fuseByRank(
  lists: EncyclopediaSelectedChunk[][],
): EncyclopediaSelectedChunk[] {
  const merged = new Map<string, EncyclopediaSelectedChunk>();
  for (const list of lists) {
    for (const [rank, chunk] of list.entries()) {
      const existing = merged.get(chunk.content);
      const contribution = 1 / (RRF_K + rank);
      if (existing) {
        existing.score += contribution;
      } else {
        merged.set(chunk.content, { ...chunk, score: contribution });
      }
    }
  }
  return [...merged.values()].sort((a, b) => b.score - a.score);
}
