/**
 * The live vector schema of a collection:
 * - `named` — the hybrid-era named dense+sparse schema (upserts/querys use
 *   `dense`/`sparse` keys); legacy collections are single unnamed dense.
 * - `sparse` — the sparse vector exists (RRF hybrid retrieval available).
 *
 * Legacy collections report `{ named: false, sparse: false }`; every
 * read/write keeps the old unnamed dense shape until the collection is
 * recreated.
 */
export interface CollectionVectorLayout {
  named: boolean;
  sparse: boolean;
}

/** The schema a freshly created collection has. */
export const MODERN_VECTOR_LAYOUT: CollectionVectorLayout = {
  named: true,
  sparse: true,
};

/** The legacy single-unnamed-vector schema (pre-hybrid era). */
export const LEGACY_VECTOR_LAYOUT: CollectionVectorLayout = {
  named: false,
  sparse: false,
};
