import {
  DENSE_VECTOR,
  SPARSE_VECTOR,
} from '../../constants/qdrant.constants.js';
import { buildSparseVector } from '../../helpers/build-sparse-vector.helper.js';
import type { CollectionVectorLayout } from '../../models/collection-vector-layout.model.js';
import type { EncyclopediaChunkPoint } from '../../models/encyclopedia-chunk.model.js';

/** Build one Qdrant upsert point from a encyclopedia chunk point. */
export function mapEncyclopediaPointToUpsert(
  point: EncyclopediaChunkPoint,
  layout: CollectionVectorLayout,
) {
  return {
    id: point.id,
    vector: layout.named
      ? {
          [DENSE_VECTOR]: point.vector,
          ...(layout.sparse && point.content.trim()
            ? { [SPARSE_VECTOR]: buildSparseVector(point.content) }
            : {}),
        }
      : point.vector,
    payload: {
      content: point.content,
      url: point.url,
      domain: point.domain,
      title: point.title,
      fetched_at: point.fetchedAt,
      content_hash: point.contentHash,
      chunk_index: point.chunkIndex,
      chunk_count: point.chunkCount,
      partition_scope: point.partitionScope,
      source_type: point.sourceType,
      mime_type: point.mimeType,
      size_bytes: point.sizeBytes,
      original_hash: point.originalHash,
      category: point.category,
      community: point.community,
      topic: point.topic,
      is_consolidated: point.isConsolidated,
      is_linked: point.isLinked,
      is_reflected: point.isReflected,
      is_friction: point.isFriction,
      superseded: point.superseded,
      superseded_by: point.supersededBy,
    },
  };
}
