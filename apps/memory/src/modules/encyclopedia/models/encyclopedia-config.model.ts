export interface EncyclopediaConfig {
  /** Master switch for the select endpoint (ENCYCLOPEDIA_SELECT_ENABLED, default true). */
  selectEnabled: boolean;
  /**
   * Fallback selection budget in chars when the caller omits `budgetChars`
   * (ENCYCLOPEDIA_BUDGET_CHARS, default 48000).
   */
  budgetChars: number;
  /**
   * Max chars per chunk (sentence-packed) — a retrieval-granularity knob,
   * not context-bound (ENCYCLOPEDIA_CHUNK_CHARS, default 1600).
   */
  chunkChars: number;
  /** Sentence overlap between adjacent chunks (ENCYCLOPEDIA_CHUNK_OVERLAP_SENTENCES, default 1). */
  chunkOverlapSentences: number;
  /**
   * Split Markdown documents at heading boundaries before sentence-packing
   * (ENCYCLOPEDIA_CHUNK_BY_HEADINGS, default true) — chunks never span
   * sections, and the sentence overlap resets at each heading.
   */
  chunkByHeadings: boolean;
  /**
   * Deepest heading level that opens a new section
   * (ENCYCLOPEDIA_MAX_HEADING_DEPTH, default 3, clamp 1–6) — deeper
   * headings stay body text.
   */
  maxHeadingDepth: number;
  /** Cosine floor; below it a chunk is noise (ENCYCLOPEDIA_SCORE_THRESHOLD, default 0.25). */
  scoreThreshold: number;
  /** Safety bound on the embed batch (ENCYCLOPEDIA_MAX_CHUNKS, default 400). */
  maxChunks: number;
  /**
   * Master switch for persistence (ENCYCLOPEDIA_PERSIST_ENABLED, default true).
   * false = exact Phase B behavior: ephemeral selection, nothing stored.
   */
  persistEnabled: boolean;
  /**
   * Ingest triage switch (ENCYCLOPEDIA_INGEST_TRIAGE_ENABLED, default true):
   * before anything is persisted, the model strips off-topic search/fetch
   * content so the encyclopedia only stores what is on-topic for the turn.
   * false = persist everything gathered (the pre-triage behavior).
   */
  ingestTriageEnabled: boolean;
  /**
   * Max global-probe passages returned per select (ENCYCLOPEDIA_PROBE_LIMIT,
   * default 3) — the past-research lane, mirroring the episode probe's
   * count cap. Each passage is at most `chunkChars` (plus neighbor expansion).
   */
  probeLimit: number;
  /**
   * Chunks before/after a probe hit to include (ENCYCLOPEDIA_NEIGHBOR_EXPANSION,
   * default 1, clamp 0–3) — the get_context-style context window.
   */
  neighborExpansion: number;
  /**
   * Absolute oversize ceiling (ENCYCLOPEDIA_MAX_DOCUMENT_CHARS, default 4_000_000,
   * clamp 100_000–16_000_000). Documents over it are REJECTED from the index
   * (never truncated) — ChatGPT's reject-rather-than-truncate lesson — but
   * still used ephemerally for the live turn.
   */
  maxDocumentChars: number;
  /**
   * Pending-document threshold that auto-triggers the supersede sweep
   * (ENCYCLOPEDIA_CONSOLIDATE_THRESHOLD, default 200).
   */
  consolidateThreshold: number;
  /**
   * Chat model for the classification job (ENCYCLOPEDIA_CLASSIFY_MODEL) — no
   * default; the classify endpoint body may pass a model instead.
   */
  classifyModel?: string;
  /**
   * Pending-document threshold that auto-triggers the classification job
   * (ENCYCLOPEDIA_CLASSIFY_THRESHOLD, default 20).
   */
  classifyThreshold: number;
  /**
   * Hybrid retrieval for the knowledge search (ENCYCLOPEDIA_HYBRID_ENABLED,
   * default true): dense semantic + sparse lexical (client TF, Qdrant IDF)
   * prefetches fused by RRF in one query. No effect on legacy
   * (unnamed-vector) collections: they keep plain dense search regardless.
   */
  hybridEnabled: boolean;
  /**
   * Score fusion method for hybrid retrieval (ENCYCLOPEDIA_HYBRID_FUSION,
   * default 'rrf'). 'dbsf' normalizes score distributions instead of ranks.
   */
  hybridFusion: 'rrf' | 'dbsf';
  /**
   * RRF weight of the dense leg (ENCYCLOPEDIA_HYBRID_DENSE_WEIGHT,
   * default 1) — weighted RRF only (Qdrant v1.17+); equal weights omit the
   * parameter.
   */
  hybridDenseWeight: number;
  /**
   * RRF weight of the sparse leg (ENCYCLOPEDIA_HYBRID_SPARSE_WEIGHT,
   * default 1).
   */
  hybridSparseWeight: number;
  /**
   * Sparse prefetch depth (ENCYCLOPEDIA_HYBRID_SPARSE_LIMIT, default 50) —
   * the lexical candidate pool feeding the fusion.
   */
  hybridSparseLimit: number;
}
