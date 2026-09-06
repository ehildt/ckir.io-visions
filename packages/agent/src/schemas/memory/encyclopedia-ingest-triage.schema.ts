import { z } from 'zod';

/**
 * Structured template for the encyclopedia ingest-triage LLM step — the JSON
 * contract the model fills when deciding which gathered items (fetched
 * documents and search-result snippets) are on-topic enough to persist into
 * the knowledge base. Mirrors the research-triage schema: the zod schema is
 * the single source of truth, the prompt describes the same shape as text,
 * and the worker parses with the tolerant LLM-JSON parser.
 */

/** One candidate verdict: keep (persist) or strip (drop), plus a reason. */
export const EncyclopediaIngestTriageDecisionSchema = z.object({
  /** The candidate's index in the payload — echoed back so the worker maps the verdict to its item. */
  index: z.number().int().min(0),
  /** True = on-topic, persist; false = off-topic, strip. */
  keep: z.boolean(),
  /** One-sentence reason — logged for observability, never shown to users. */
  reason: z.string(),
});

export const EncyclopediaIngestTriageSchema = z.object({
  decisions: z.array(EncyclopediaIngestTriageDecisionSchema).max(150),
});

export type EncyclopediaIngestTriageDecision = z.infer<typeof EncyclopediaIngestTriageDecisionSchema>;
export type EncyclopediaIngestTriage = z.infer<typeof EncyclopediaIngestTriageSchema>;
