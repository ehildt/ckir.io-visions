import { describe, expect, it } from 'vitest';

import type { ConstellationNode } from '../../../memory-constellation/MemoryConstellation.types';
import { metadataTags } from './metadata-tags.helper';

function makeNode(
  overrides: Partial<ConstellationNode> = {},
): ConstellationNode {
  return {
    id: 'a',
    label: 'stellar blade',
    topicKey: 'stellar blade',
    text: 'Stellar Blade is an action game.',
    keys: [],
    ...overrides,
  };
}

describe('metadataTags', () => {
  it('keeps ordinary meta rows', () => {
    const node = makeNode({
      meta: [
        { label: 'category', value: 'games' },
        { label: 'created', value: '2025-01-12' },
      ],
    });
    expect(metadataTags(node)).toHaveLength(2);
  });

  it('returns an empty list when the node carries no meta', () => {
    expect(metadataTags(makeNode())).toEqual([]);
  });

  it('drops rows duplicating the header label (title, category hubs)', () => {
    const node = makeNode({
      meta: [
        { label: 'title', value: 'stellar blade' },
        { label: 'domain', value: 'pcgamer.com' },
      ],
    });
    expect(metadataTags(node)).toEqual([
      { label: 'domain', value: 'pcgamer.com' },
    ]);
  });

  it('never shows the url row as a tag', () => {
    const meta = [{ label: 'url', value: 'https://example.com/doc' }];
    expect(
      metadataTags(makeNode({ meta, downloadUrl: '/api/download' })),
    ).toEqual([]);
    expect(metadataTags(makeNode({ meta }))).toEqual([]);
  });

  it('drops a summary row already contained in the body text', () => {
    const summary = 'Everything known about the games cluster.';
    const node = makeNode({
      text: `games — ${summary} — click to toggle`,
      meta: [
        { label: 'summary', value: summary },
        { label: 'records', value: '17' },
      ],
    });
    expect(metadataTags(node)).toEqual([{ label: 'records', value: '17' }]);
  });
});
