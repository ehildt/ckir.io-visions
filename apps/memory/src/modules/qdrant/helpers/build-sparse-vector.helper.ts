/** A Qdrant sparse vector: parallel index/value arrays (indices ≤ 2³¹−1). */
interface SparseVector {
  indices: number[];
  values: number[];
}

/**
 * Build the sparse (lexical) vector of one text for hybrid retrieval:
 * tokenize (lowercased letter/number runs — Latin words become word tokens,
 * CJK code points become character tokens), count term frequencies, and hash
 * each token to a stable uint32 index (FNV-1a). Qdrant applies corpus IDF at
 * search time (the sparse vector's `idf` modifier), so the values are raw TF.
 *
 * Deterministic: the same text always hashes to the same indices — ingest
 * and query MUST therefore use this same function. Index collisions map two
 * tokens to one dimension (a rare, small score noise — acceptable for
 * recall-oriented lexical search).
 */
export function buildSparseVector(text: string): SparseVector {
  const counts = new Map<number, number>();
  const tokens = text.match(/[\p{L}\p{N}]+/gu) ?? [];
  for (const token of tokens) {
    const index = fnv1a(token.toLowerCase());
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  const indices = [...counts.keys()].sort((a, b) => a - b);
  return { indices, values: indices.map((index) => counts.get(index)!) };
}

/** FNV-1a 32-bit hash of a string, as a non-negative int32 (sparse index). */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0;
  }
  return hash & 0x7fffffff;
}
