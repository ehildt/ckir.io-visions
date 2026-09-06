import type {
  ConstellationCluster,
  ConstellationCommunity,
  ConstellationTopic,
} from '../MemoryConstellation.types';
import { clusterNodeId } from './build-cluster-node.helper';
import { communityNodeId } from './build-community-node.helper';
import { hubIdFor } from './hub-id-for.helper';
import { ROOT_NODE_ID } from './root-node-id.constant';

/**
 * Hub ids: each topic's main dot (the synthetic title dot when it exists,
 * else the first member) — plus every community hub id, cluster hub id, and
 * the ZERO root id.
 */
export function buildHubIds(
  topics: readonly ConstellationTopic[],
  collapsedKeys: ReadonlySet<string>,
  clusters: readonly ConstellationCluster[] = [],
  communities: readonly ConstellationCommunity[] = [],
  mainNodesEnabled = false,
): Set<string> {
  const hubIds = new Set<string>();
  for (const topic of topics) {
    const hubId = hubIdFor(topic, collapsedKeys, mainNodesEnabled);
    if (hubId) hubIds.add(hubId);
  }
  for (const community of communities) {
    hubIds.add(communityNodeId(community.key));
  }
  for (const cluster of clusters) {
    hubIds.add(clusterNodeId(cluster.key));
  }
  hubIds.add(ROOT_NODE_ID);
  return hubIds;
}
