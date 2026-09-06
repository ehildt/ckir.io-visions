import type {
  ConstellationCluster,
  ConstellationNode,
  ConstellationTopic,
} from '../MemoryConstellation.types';
import { mapClusterEntry } from './map-cluster-entry.helper';

/**
 * Group topics into second-level clusters by their members'
 * `clusterKey` (a broad category like `games` or `pets`, or — once the
 * server's cluster job ran — the server cluster id). Every category
 * gets a hub — even a lone topic — so it can connect to the ZERO root.
 * Deterministic: first-seen cluster order.
 */
export function buildClusters(
  nodes: readonly ConstellationNode[],
  topics: readonly ConstellationTopic[],
): ConstellationCluster[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const topicKeysByCluster = new Map<string, string[]>();
  const memberIdsByCluster = new Map<string, string[]>();
  for (const topic of topics) {
    const clusterKey = topic.memberIds
      .map((id) => nodeById.get(id)?.clusterKey)
      .find((key) => key != null && key.trim().length > 0);
    if (!clusterKey) continue;
    const topicKeys = topicKeysByCluster.get(clusterKey) ?? [];
    topicKeys.push(topic.key);
    topicKeysByCluster.set(clusterKey, topicKeys);
    const memberIds = memberIdsByCluster.get(clusterKey) ?? [];
    memberIds.push(...topic.memberIds);
    memberIdsByCluster.set(clusterKey, memberIds);
  }
  return [...topicKeysByCluster.entries()]
    .filter(([, topicKeys]) => topicKeys.length >= 1)
    .map((entry, index) =>
      mapClusterEntry(
        entry,
        index,
        memberIdsByCluster,
        pluralityCategory(entry[0], memberIdsByCluster, nodeById),
      ),
    );
}

/**
 * The human category to print for one cluster hub: the member records'
 * plurality `category` (ties: first-seen member order wins). Undefined when
 * no member carries a category — the hub then shows no empty category tag.
 * The cluster KEY may be a server cluster id (a hash), which must never
 * surface as text — this plurality label is the readable fallback.
 */
function pluralityCategory(
  clusterKey: string,
  memberIdsByCluster: Map<string, string[]>,
  nodeById: Map<string, ConstellationNode>,
): string | undefined {
  const counts = new Map<string, number>();
  for (const memberId of memberIdsByCluster.get(clusterKey) ?? []) {
    const category = nodeById.get(memberId)?.category?.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}
