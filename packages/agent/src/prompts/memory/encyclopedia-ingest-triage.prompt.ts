import { limitText } from '@triplef/helpers/limit-text';

import { EncyclopediaIngestTriageSchema } from '../../schemas/memory/encyclopedia-ingest-triage.schema.js';
import { buildStructuredPrompt } from '../helpers/build-structured-prompt.helper.js';

/**
 * Prompt for the encyclopedia ingest-triage step — the model reads the
 * gathered candidates (fetched documents + search-result snippets) against
 * the current topic and decides which are on-topic enough to persist into
 * the knowledge base. Structured output enforced by contract: the worker
 * parses the answer with the tolerant LLM-JSON parser and validates it
 * against EncyclopediaIngestTriageSchema.
 */
export const ENCYCLOPEDIA_INGEST_TRIAGE_INSTRUCTIONS = buildStructuredPrompt(EncyclopediaIngestTriageSchema, {
  before: `ENCYCLOPEDIA INGEST TRIAGE — one purpose: keep the knowledge base clean by persisting ONLY content that is on-topic for the current request.

You receive:
- TOPIC: what the user is currently asking about (the retrieval query).
- CANDIDATES: a numbered list of items gathered this turn — fetched documents and search-result snippets — each with a title and a short excerpt.

For each candidate decide:
- keep=true: substantively about TOPIC (or a closely related aspect the user will plausibly need again) — worth persisting.
- keep=false: off-topic, incidental, navigation, ads, clickbait, login walls, or content that merely mentions TOPIC in passing — strip it.

Rules:
- Judge from the excerpt alone — you have not read the full page.
- When in doubt, keep=false: a clean knowledge base beats a complete one.
- Never invent facts; the reason is one short sentence of honest justification.
- Output one decision per candidate, echoing its index.

OUTPUT FORMAT — output ONLY valid JSON:`,
  after: 'No markdown fences, no explanations.',
});

/**
 * Assembles the triage payload: the topic plus the candidates as a bounded
 * JSON list. The caller caps the payload before calling (the worker's
 * payload cap).
 */
export function buildEncyclopediaIngestTriagePrompt(params: {
  topic: string;
  candidates: Array<{ index: number; title?: string; excerpt: string }>;
  maxPayloadChars?: number;
}): string {
  const body = JSON.stringify(
    params.candidates.map((candidate) => ({
      index: candidate.index,
      title: candidate.title ?? '(untitled)',
      excerpt: candidate.excerpt,
    })),
  );
  return [
    `TOPIC: ${params.topic}`,
    `CANDIDATES:\n${limitText(body, params.maxPayloadChars)}`,
    'Write the decisions JSON object now.',
  ].join('\n\n');
}
