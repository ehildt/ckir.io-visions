import type { ConstellationTopic } from '../MemoryConstellation.types';
import { hubIdFor } from './hub-id-for.helper';
import { ROOT_NODE_ID } from './root-node-id.constant';

/** Build a root edge from a topic hub. */
export function mapTopicToRootEdge(
  topic: ConstellationTopic,
  collapsedKeys: ReadonlySet<string>,
  mainNodesEnabled = false,
) {
  return {
    source: hubIdFor(topic, collapsedKeys, mainNodesEnabled),
    target: ROOT_NODE_ID,
    kind: 'root' as const,
  };
}
