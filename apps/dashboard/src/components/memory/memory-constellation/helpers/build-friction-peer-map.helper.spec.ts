import { describe, expect, it } from 'vitest';

import type { PreparedLink } from '../MemoryConstellation.types';
import { buildFrictionPeerMap } from './build-friction-peer-map.helper';

describe('buildFrictionPeerMap', () => {
  it('maps friction links to both endpoint directions', () => {
    const links: PreparedLink[] = [
      { a: 0, b: 1, kind: 'friction', alpha: 0.8 },
    ];
    const peers = buildFrictionPeerMap(links);
    expect(peers.get(0)?.has(1)).toBe(true);
    expect(peers.get(1)?.has(0)).toBe(true);
  });

  it('ignores non-friction links', () => {
    const links: PreparedLink[] = [
      { a: 0, b: 1, kind: 'intra', alpha: 0.5 },
      { a: 1, b: 2, kind: 'inter', alpha: 0.5, score: 0.9 },
      { a: 2, b: 3, kind: 'root', alpha: 0.5 },
    ];
    expect(buildFrictionPeerMap(links).size).toBe(0);
  });

  it('collects multiple friction peers of one node', () => {
    const links: PreparedLink[] = [
      { a: 0, b: 1, kind: 'friction', alpha: 0.8 },
      { a: 0, b: 2, kind: 'friction', alpha: 0.8 },
    ];
    const peers = buildFrictionPeerMap(links);
    expect([...(peers.get(0) ?? [])].sort()).toEqual([1, 2]);
    expect(peers.get(1)?.has(0)).toBe(true);
    expect(peers.get(2)?.has(0)).toBe(true);
  });
});
