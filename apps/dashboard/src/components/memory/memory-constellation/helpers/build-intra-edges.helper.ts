import type {
  ConstellationEdge,
  ConstellationTopic,
} from '../MemoryConstellation.types';

/**
 * Intra edges: each leaf connects to its main dot (skips collapsed topics —
 * their leafs are hidden). Under the main-node regime the main dot is the
 * synthetic title dot and EVERY member links to it; otherwise each leaf
 * links to the first member (the legacy main dot).
 */
export function buildIntraEdges(
  topics: readonly ConstellationTopic[],
  collapsedKeys: ReadonlySet<string>,
  mainNodesEnabled = false,
): ConstellationEdge[] {
  const edges: ConstellationEdge[] = [];
  for (const topic of topics) {
    if (collapsedKeys.has(topic.key)) continue;
    if (topic.memberIds.length < 2) continue;
    if (mainNodesEnabled) {
      for (const memberId of topic.memberIds) {
        edges.push({
          source: `topic:${topic.key}`,
          target: memberId,
          kind: 'intra',
        });
      }
      continue;
    }
    const hub = topic.memberIds[0];
    for (let i = 1; i < topic.memberIds.length; i++) {
      edges.push({ source: hub, target: topic.memberIds[i], kind: 'intra' });
    }
  }
  return edges;
}
