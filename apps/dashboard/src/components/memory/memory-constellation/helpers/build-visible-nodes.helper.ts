import type {
  ConstellationFriction,
  ConstellationMainNodeSummary,
  ConstellationNode,
  ConstellationPosition,
  ConstellationTopic,
  VisibleAccumulator,
} from '../MemoryConstellation.types';
import { appendMemberNodes } from './append-member-nodes.helper';
import { appendTopicNode } from './append-topic-node.helper';
import { computeRelaxedCentroid } from './compute-relaxed-centroid.helper';

/**
 * Collapse collapsed topics into their main dot and resolve every other
 * topic's members to their relaxed positions. When the space feeds
 * server-written main-node summaries (`mainNodeByKey` defined), every
 * multi-member topic keeps its synthetic main dot visible while expanded
 * too — the dot between the hub tier and the leafs carries the summary of
 * the attached leafs (fallback: the member rollup). Legacy spaces (no main
 * nodes) keep the first member as the expanded main dot. The member lookup
 * and frictions feed the main dots' leaf rollup (hub tooltip meta).
 */
export function buildVisibleNodes(
  topics: readonly ConstellationTopic[],
  relaxedPositions: ReadonlyMap<string, ConstellationPosition>,
  nodeById: Map<string, ConstellationNode>,
  collapsedKeys: ReadonlySet<string>,
  frictions: readonly ConstellationFriction[] = [],
  mainNodeByKey?: ReadonlyMap<string, ConstellationMainNodeSummary>,
): VisibleAccumulator {
  const acc: VisibleAccumulator = {
    visibleNodes: [],
    positions: new Map(),
    nodeIndex: new Map(),
  };
  for (const topic of topics) {
    // A single-member topic never gets a main dot — there is nothing to
    // fold, so its member renders directly.
    const multiMember = topic.memberIds.length > 1;
    if (!multiMember) {
      appendMemberNodes(topic, relaxedPositions, nodeById, acc);
      continue;
    }
    const collapsed = collapsedKeys.has(topic.key);
    if (collapsed || mainNodeByKey !== undefined) {
      appendTopicNode(
        topic,
        relaxedPositions,
        acc,
        nodeById,
        frictions,
        mainNodeByKey,
      );
    }
    if (collapsed) continue;
    appendMemberNodes(
      topic,
      relaxedPositions,
      nodeById,
      acc,
      mainNodeByKey !== undefined
        ? computeRelaxedCentroid(topic, relaxedPositions)
        : undefined,
    );
  }
  return acc;
}
