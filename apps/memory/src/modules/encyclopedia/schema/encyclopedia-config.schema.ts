import Joi from 'joi';

import type { EncyclopediaConfig } from '../models/encyclopedia-config.model.js';

export const EncyclopediaConfigSchema = Joi.object<EncyclopediaConfig>({
  selectEnabled: Joi.boolean().optional(),
  budgetChars: Joi.number().integer().min(1000).max(500_000).optional(),
  chunkChars: Joi.number().integer().min(200).max(8000).optional(),
  chunkOverlapSentences: Joi.number().integer().min(0).max(3).optional(),
  chunkByHeadings: Joi.boolean().optional(),
  maxHeadingDepth: Joi.number().integer().min(1).max(6).optional(),
  scoreThreshold: Joi.number().min(0).max(1).optional(),
  maxChunks: Joi.number().integer().min(16).max(4000).optional(),
  persistEnabled: Joi.boolean().optional(),
  ingestTriageEnabled: Joi.boolean().optional(),
  probeLimit: Joi.number().integer().min(1).max(20).optional(),
  neighborExpansion: Joi.number().integer().min(0).max(3).optional(),
  maxDocumentChars: Joi.number()
    .integer()
    .min(100_000)
    .max(16_000_000)
    .optional(),
  consolidateThreshold: Joi.number().integer().min(1).optional(),
  classifyModel: Joi.string().optional(),
  classifyThreshold: Joi.number().integer().min(1).optional(),
  // Hybrid retrieval (dense + sparse fused): enable switch, fusion method,
  // RRF leg weights, and the sparse prefetch depth.
  hybridEnabled: Joi.boolean().optional(),
  hybridFusion: Joi.string().valid('rrf', 'dbsf').optional(),
  hybridDenseWeight: Joi.number().min(0).optional(),
  hybridSparseWeight: Joi.number().min(0).optional(),
  hybridSparseLimit: Joi.number().integer().min(1).max(1000).optional(),
}).required();
