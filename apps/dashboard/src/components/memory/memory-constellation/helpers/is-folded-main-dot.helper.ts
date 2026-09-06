import type { ConstellationNode } from '../MemoryConstellation.types';

/**
 * Whether a title-tier main dot currently folds content: the dot exists
 * (isTopic) and its blob is collapsed. Drives the multi-leaf ring — an
 * expanded blob's main dot carries no ring residue.
 */
export function isFoldedMainDot(
  node: Pick<ConstellationNode, 'isTopic' | 'topicKey'>,
  collapsedKeys: ReadonlySet<string>,
): boolean {
  return node.isTopic === true && collapsedKeys.has(node.topicKey);
}
