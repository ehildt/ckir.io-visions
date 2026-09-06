import type { ConstellationTopic } from '../MemoryConstellation.types';

/**
 * The main dot id for a topic: the synthetic title-tier dot (`topic:<key>`)
 * whenever the blob has one — every collapsed multi-member topic, and every
 * multi-member topic outright when the space feeds main-node summaries — or
 * the single/first member otherwise. Single-member topics never collapse
 * (there is nothing to expand), so they always resolve to their member.
 */
export function hubIdFor(
  topic: ConstellationTopic,
  collapsedKeys: ReadonlySet<string>,
  mainNodesEnabled = false,
): string {
  const hasMainDot =
    topic.memberIds.length > 1 &&
    (mainNodesEnabled || collapsedKeys.has(topic.key));
  return hasMainDot ? `topic:${topic.key}` : topic.memberIds[0];
}
