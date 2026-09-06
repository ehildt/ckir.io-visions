import { DENSE_VECTOR } from '../constants/qdrant.constants.js';

/**
 * Read the dense vector back from a point regardless of collection era:
 * legacy collections store the vector as a flat `number[]`; hybrid-era
 * collections store named vectors (`{ dense: [...], sparse: {...} }`).
 * Missing/corrupt vectors degrade to an empty array (callers skip it).
 */
export function readDenseVector(vector: unknown): number[] {
  if (Array.isArray(vector)) return vector as number[];
  if (vector && typeof vector === 'object' && DENSE_VECTOR in vector) {
    const dense = (vector as Record<string, unknown>)[DENSE_VECTOR];
    if (Array.isArray(dense)) return dense as number[];
  }
  return [];
}
