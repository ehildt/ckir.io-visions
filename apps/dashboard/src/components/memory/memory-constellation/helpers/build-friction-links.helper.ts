import type {
  ConstellationFriction,
  PreparedLink,
} from '../MemoryConstellation.types';

/** Fixed opacity for friction (warning) edges — clearly visible, not faint. */
const FRICTION_ALPHA = 0.8;

/**
 * Resolve open frictions to visible-node indices. Frictions never draw as
 * edges — they feed the hover highlight (buildFrictionPeerMap): hovering a
 * contested dot pulses a black halo on the dots it conflicts with. A pair
 * only enters the map when BOTH endpoints are visible — a collapsed topic
 * hides its leaves, so a friction between two hidden leaves yields nothing
 * until the topic is expanded.
 */
export function buildFrictionLinks(
  frictions: readonly ConstellationFriction[],
  nodeIndex: ReadonlyMap<string, number>,
): PreparedLink[] {
  const links: PreparedLink[] = [];
  for (const friction of frictions) {
    const a = nodeIndex.get(friction.source);
    const b = nodeIndex.get(friction.target);
    if (a === undefined || b === undefined) continue;
    links.push({ a, b, kind: 'friction', alpha: FRICTION_ALPHA });
  }
  return links;
}
