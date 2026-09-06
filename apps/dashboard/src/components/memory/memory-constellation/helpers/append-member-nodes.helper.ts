import type {
  ConstellationNode,
  ConstellationPosition,
  ConstellationTopic,
  VisibleAccumulator,
} from '../MemoryConstellation.types';

/**
 * A leaf further than this (world units) from its main dot is auto-collapsed
 * (hidden) — it reads as a stray dot, so it folds back into the topic.
 */
const COLLAPSE_DISTANCE = 80;

/** Euclidean distance between two world positions. */
function distance3d(a: ConstellationPosition, b: ConstellationPosition) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

/**
 * Append an expanded/small topic's members at their relaxed positions. The
 * stray-leaf distance is measured against the main dot: the blob centroid
 * when a synthetic main dot was passed, else the first member (the legacy
 * main dot, which always stays visible itself).
 */
export function appendMemberNodes(
  topic: ConstellationTopic,
  relaxedPositions: ReadonlyMap<string, ConstellationPosition>,
  nodeById: Map<string, ConstellationNode>,
  acc: VisibleAccumulator,
  mainDotPosition?: ConstellationPosition,
): void {
  const hubPos = mainDotPosition ?? relaxedPositions.get(topic.memberIds[0]);
  for (const memberId of topic.memberIds) {
    const node = nodeById.get(memberId);
    const pos = relaxedPositions.get(memberId);
    if (!node || !pos) continue;
    const isMainDotMember = !mainDotPosition && memberId === topic.memberIds[0];
    if (
      !isMainDotMember &&
      hubPos &&
      distance3d(pos, hubPos) > COLLAPSE_DISTANCE
    )
      continue;
    acc.nodeIndex.set(node.id, acc.visibleNodes.length);
    acc.visibleNodes.push(node);
    acc.positions.set(node.id, pos);
  }
}
