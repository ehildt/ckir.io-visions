import { getBooleanEnv } from '@triplef/helpers/get-boolean-env';
import { getNumberEnv } from '@triplef/helpers/get-number-env';

import type { EncyclopediaConfig } from '../models/encyclopedia-config.model.js';

export function EncyclopediaConfigAdapter(
  env = process.env,
): EncyclopediaConfig {
  return {
    selectEnabled: getBooleanEnv(env.ENCYCLOPEDIA_SELECT_ENABLED, true)!,
    budgetChars: getNumberEnv(env.ENCYCLOPEDIA_BUDGET_CHARS, 48_000) as number,
    chunkChars: getNumberEnv(env.ENCYCLOPEDIA_CHUNK_CHARS, 1600) as number,
    chunkOverlapSentences: getNumberEnv(
      env.ENCYCLOPEDIA_CHUNK_OVERLAP_SENTENCES,
      1,
    ) as number,
    chunkByHeadings: getBooleanEnv(env.ENCYCLOPEDIA_CHUNK_BY_HEADINGS, true)!,
    maxHeadingDepth: getNumberEnv(
      env.ENCYCLOPEDIA_MAX_HEADING_DEPTH,
      3,
    ) as number,
    scoreThreshold: getNumberEnv(
      env.ENCYCLOPEDIA_SCORE_THRESHOLD,
      0.25,
    ) as number,
    maxChunks: getNumberEnv(env.ENCYCLOPEDIA_MAX_CHUNKS, 400) as number,
    persistEnabled: getBooleanEnv(env.ENCYCLOPEDIA_PERSIST_ENABLED, true)!,
    ingestTriageEnabled: getBooleanEnv(
      env.ENCYCLOPEDIA_INGEST_TRIAGE_ENABLED,
      true,
    )!,
    probeLimit: getNumberEnv(env.ENCYCLOPEDIA_PROBE_LIMIT, 3) as number,
    neighborExpansion: getNumberEnv(
      env.ENCYCLOPEDIA_NEIGHBOR_EXPANSION,
      1,
    ) as number,
    maxDocumentChars: getNumberEnv(
      env.ENCYCLOPEDIA_MAX_DOCUMENT_CHARS,
      4_000_000,
    ) as number,
    consolidateThreshold: getNumberEnv(
      env.ENCYCLOPEDIA_CONSOLIDATE_THRESHOLD,
      200,
    ) as number,
    classifyModel: env.ENCYCLOPEDIA_CLASSIFY_MODEL || undefined,
    classifyThreshold: getNumberEnv(
      env.ENCYCLOPEDIA_CLASSIFY_THRESHOLD,
      20,
    ) as number,
    hybridEnabled: getBooleanEnv(env.ENCYCLOPEDIA_HYBRID_ENABLED, true)!,
    hybridFusion:
      env.ENCYCLOPEDIA_HYBRID_FUSION === 'dbsf'
        ? ('dbsf' as const)
        : ('rrf' as const),
    hybridDenseWeight: getNumberEnv(
      env.ENCYCLOPEDIA_HYBRID_DENSE_WEIGHT,
      1,
    ) as number,
    hybridSparseWeight: getNumberEnv(
      env.ENCYCLOPEDIA_HYBRID_SPARSE_WEIGHT,
      1,
    ) as number,
    hybridSparseLimit: getNumberEnv(
      env.ENCYCLOPEDIA_HYBRID_SPARSE_LIMIT,
      50,
    ) as number,
  };
}
