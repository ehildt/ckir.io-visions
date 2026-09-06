import type { PreparedLink } from '../MemoryConstellation.types';

/**
 * Adjacency for the friction hover highlight: node index → the indices it
 * shares an open friction with (both directions). Built once per prepared
 * scene; the draw loop looks up the hovered dot's peers to pulse their
 * black halo.
 */
export function buildFrictionPeerMap(
  linkIndices: readonly PreparedLink[],
): Map<number, Set<number>> {
  const peers = new Map<number, Set<number>>();
  const push = (from: number, to: number): void => {
    const list = peers.get(from) ?? new Set<number>();
    list.add(to);
    peers.set(from, list);
  };
  for (const link of linkIndices) {
    if (link.kind !== 'friction') continue;
    push(link.a, link.b);
    push(link.b, link.a);
  }
  return peers;
}
