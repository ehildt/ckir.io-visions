/** The hybrid knobs both lane configs share (identical field names). */
interface HybridFusionConfig {
  hybridFusion: 'rrf' | 'dbsf';
  hybridDenseWeight: number;
  hybridSparseWeight: number;
}

/**
 * The fusion clause of a hybrid query: rank-based RRF by default (weighted
 * when one leg's weight leaves 1 — Qdrant v1.17+), or distribution-based
 * DBSF (`fusion: 'dbsf'`). Rank fusion keeps scores of the two lanes
 * incomparable scales from leaking into the final order.
 */
export function buildFusionQuery(config: HybridFusionConfig):
  | {
      fusion: 'dbsf';
    }
  | {
      rrf: { weights?: [number, number] };
    } {
  if (config.hybridFusion === 'dbsf') return { fusion: 'dbsf' };
  const { hybridDenseWeight, hybridSparseWeight } = config;
  return {
    rrf:
      hybridDenseWeight === 1 && hybridSparseWeight === 1
        ? {}
        : { weights: [hybridDenseWeight, hybridSparseWeight] },
  };
}
