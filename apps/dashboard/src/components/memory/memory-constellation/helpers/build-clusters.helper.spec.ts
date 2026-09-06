import { describe, expect, it } from 'vitest';

import type { ConstellationNode } from '../MemoryConstellation.types';
import { buildClusters } from './build-clusters.helper';

const makeNode = (
  id: string,
  topicKey: string,
  clusterKey?: string,
): ConstellationNode => ({
  id,
  label: id,
  topicKey,
  text: id,
  keys: [topicKey],
  clusterKey,
});

const topics = (keys: string[]) =>
  keys.map((key, i) => ({
    key,
    label: key,
    color: `#00${i}`,
    memberIds: [`${key}-a`],
  }));

describe('buildClusters', () => {
  it('groups topics whose members share a clusterKey', () => {
    const nodes = [
      makeNode('nte-a', 'nte', 'games'),
      makeNode('wuthering waves-a', 'wuthering waves', 'games'),
      makeNode('dog-a', 'dog', 'pets'),
    ];
    const clusters = buildClusters(
      nodes,
      topics(['nte', 'wuthering waves', 'dog']),
    );

    expect(clusters).toHaveLength(2);
    expect(clusters[0]).toMatchObject({
      key: 'games',
      label: 'games',
      memberTopicKeys: ['nte', 'wuthering waves'],
      memberIds: ['nte-a', 'wuthering waves-a'],
    });
    expect(clusters[1]).toMatchObject({
      key: 'pets',
      memberTopicKeys: ['dog'],
    });
  });

  it('keeps clusters backed by a single topic (so they reach the root)', () => {
    const nodes = [
      makeNode('dog-a', 'dog', 'pets'),
      makeNode('dog health-a', 'dog health'),
    ];
    const clusters = buildClusters(nodes, topics(['dog', 'dog health']));

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({
      key: 'pets',
      memberTopicKeys: ['dog'],
    });
  });

  it('ignores blank clusterKeys', () => {
    const nodes = [makeNode('a', 'x', '  '), makeNode('b', 'y', '')];
    expect(buildClusters(nodes, topics(['x', 'y']))).toEqual([]);
  });

  it('assigns a stable palette color per cluster', () => {
    const nodes = [
      makeNode('a-a', 'a', 'games'),
      makeNode('b-a', 'b', 'games'),
      makeNode('c-a', 'c', 'pets'),
      makeNode('d-a', 'd', 'pets'),
    ];
    const clusters = buildClusters(nodes, topics(['a', 'b', 'c', 'd']));

    expect(clusters).toHaveLength(2);
    expect(clusters[0]?.color).not.toBe(clusters[1]?.color);
  });

  it('derives the printable category label from the members plurality category', () => {
    const nodes: ConstellationNode[] = [
      { ...makeNode('a-a', 'a', 'c1d2e3f4'), category: 'games' },
      { ...makeNode('a-b', 'a', 'c1d2e3f4'), category: 'games' },
      { ...makeNode('b-a', 'b', 'c1d2e3f4'), category: 'pets' },
    ];
    const clusters = buildClusters(nodes, topics(['a', 'b']));

    // The key stays the hash — the label is the human category.
    expect(clusters).toHaveLength(1);
    expect(clusters[0].key).toBe('c1d2e3f4');
    expect(clusters[0].categoryLabel).toBe('games');
  });

  it('leaves the category label undefined when no member carries a category', () => {
    const nodes = [makeNode('a-a', 'a', 'c1d2e3f4')];
    const clusters = buildClusters(nodes, topics(['a']));

    expect(clusters[0].categoryLabel).toBeUndefined();
  });
});
