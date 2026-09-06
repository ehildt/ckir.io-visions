import type { ConstellationNode } from '../../../memory-constellation/MemoryConstellation.types';

/**
 * The meta rows worth showing as tags in the metadata column: strips rows
 * duplicating or superseded by what the column already displays —
 * - any row whose value IS the node's label (the header at the top: a
 *   document's `title`, a hub's `category`/`community` row),
 * - the `url` row (the source link is never tag material; uploaded
 *   documents already offer it via the download button),
 * - a `summary` row already contained in the body text (cluster hubs).
 */
export function metadataTags(
  node: ConstellationNode,
): Array<{ label: string; value: string }> {
  return (node.meta ?? []).filter((row) => {
    if (row.value === node.label) return false;
    if (row.label === 'url') return false;
    if (row.label === 'summary' && node.text.includes(row.value)) return false;
    return true;
  });
}
