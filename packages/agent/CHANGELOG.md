# @triplef/agent

## 1.0.0

### Major Changes

- ec0d0a5: Initial release of the agent-domain library — the structured-output schemas, prompt builders, and model tools shared across the apps, with three subpath exports:

  - `@triplef/agent/schemas` — the Zod schemas and `z.infer` types for intent classification, response templates, and memory extraction/consolidation/profile, plus the URL-trust and Zod-shape helpers (`formatZodShape`, `deriveSchemaKeys`), and the `EncyclopediaSelectInput`/`EncyclopediaSelectResult` contract for the ephemeral retrieval-selection endpoint.
  - `@triplef/agent/prompts` — the harness and memory prompt builders, the snippet system, and the `buildStructuredPrompt` assembler that renders a schema's JSON shape into a prompt template. `buildMemoryProfilePrompt` now takes an optional `maxPayloadChars` valve (numCtx-derived, marked when it fires) instead of hardcoded `.slice(0, 1500)` cuts.
  - `@triplef/agent/tools` — the search/tool factories (Serper, Bright Data, YouTube, web-fetch, image-variants, memory) with a decoupled `ToolDependencies` contract (structural `ToolLogger` and `ToolConfigSnapshot`, no `@nestjs/common` or app-config imports). Tools return full content (no silent `.slice` caps); `web-fetch` now extracts the main article as structural Markdown via `@mozilla/readability` + `linkedom` + `turndown` instead of a lossy regex strip.

  Drift elimination: prompt JSON shapes and template key lists are now derived from their Zod schemas, so the prompt, the validator, and the dashboard types share one source of truth. The EODHD tools remain in the server (they are coupled to the stock-data domain).

### Minor Changes

- 3fc42b2: New harness prompt `buildDescribePdfPagePrompt` (`@triplef/agent/prompts`): one vision pass over a single rendered pdf page — layout description, verbatim transcription of all visible text, and one factual sentence per figure. Free-text by design (the output is chunked and embedded into the document's encyclopedia entry as-is); defines the explicit empty-page answer ("This page contains no readable content.") and contains no template placeholders.
- 6d288c6: Encyclopedia ingest triage contract — the LLM gate that keeps the knowledge base on-topic.

  - **New schema:** `EncyclopediaIngestTriageSchema` / `EncyclopediaIngestTriageDecisionSchema` — the structured verdict (`index`, `keep`, `reason`) the memory app fills per gathered candidate before persisting.
  - **New prompt:** `ENCYCLOPEDIA_INGEST_TRIAGE_INSTRUCTIONS` + `buildEncyclopediaIngestTriagePrompt` — the triage system/user prompt pair, mirroring the research-triage prompt style.
  - **Docs:** corrected the `EncyclopediaSelectInput.searchResults` comment — persistence is triage-gated, no longer "remembers every source touched".

- 3fc42b2: Rename the retrieval-selection contract from "lexicon" to "encyclopedia" and add recall lifecycle flags:

  - **`LexiconSelectInput` → `EncyclopediaSelectInput`**, **`LexiconSelectResult` → `EncyclopediaSelectResult`**, **`LexiconSourceDocument` → `EncyclopediaSourceDocument`**, **`LexiconSelectedChunk` → `EncyclopediaSelectedChunk`**, **`LexiconSearchResult` → `EncyclopediaSearchResult`** (breaking rename — the memory app's `/encyclopedia/select` endpoint matches).
  - **`EncyclopediaSelectInput.model?`** — the turn's chat model, threaded to the classification job when the select call crosses the classify threshold (so classification runs without a dedicated `ENCYCLOPEDIA_CLASSIFY_MODEL`).
  - **`MemoryPoint` lifecycle flags** — `isConsolidated`, `isReflected`, `isFriction`, `superseded`, `supersededBy`, so recall callers can annotate contested/stale records.

- 3fc42b2: Agentic encyclopedia tools: the execute wave learns to consult and deep-dive the knowledge base on its own.

  - **New tools:** `encyclopedia-search` (semantic search over the knowledge base — verbatim passages of fetched pages and uploaded documents with source url, chunk coordinates, and fetch date; optionally scoped to one document url or domain) and `encyclopedia-read` (windowed full-content read of one stored document by url, chunked continuation via `startChunk` — the deep-dive loop). Both render plain provenance text results with citeable urls, mirroring the memory tools.
  - **New registry constant:** `ENCYCLOPEDIA_TOOL_NAMES` — the always-on wave tools offered whenever the memory feature is enabled; deliberately outside `TOOL_NAMES`/`MEMORY_TOOL_NAMES` (never classifier-picked).
  - **New wire contracts:** `EncyclopediaSearchInput`/`EncyclopediaSearchHit` and `EncyclopediaDocumentInput`/`EncyclopediaDocumentResult` (shared by the memory app's endpoints and the server harness), mirroring `encyclopedia-select.model.ts`.
  - **New prompt builder:** `buildCognitionProfileSection` — the cognition profile block for the intent classifier's memory probe, next to the fact probe and episode probe.

- 3fc42b2: Encyclopedia classification prompt gains a known-topics vocabulary: `buildEncyclopediaClassifyPrompt(knownCategories, knownTopics)` injects the encyclopedia's existing topic labels as a reuse-first hint so tier-1 snippet classification extends the taxonomy instead of minting a variant per source (`nte` vs. `neverness to everness`). The topic rule now also bars domains and site names explicitly.
- ec0d0a5: Fetch tools now echo the requested `url` in their result (`webFetch`, `serperWebpageScrape`, `brightDataWebpageScrape`), so the harness encyclopedia can persist fetched content keyed by source URL instead of treating it as ephemeral. The `webFetch` description now encourages fetching the most relevant search results, and the intent-selection prompt gains FETCH-AFTER-SEARCH RULES instructing the model to fetch 1–3 result pages after a web search when full content would improve the answer.
- 3fc42b2: GraphRAG macro-taxonomy tiers (cluster → community → hub):

  - `ExtractionSchema` gains an optional `community` field (turn-side and per-fact) — the plural sub-family tier one level below the category cluster (e.g. `survival-games` under `games`). Fact/turn docs now name the tiers explicitly (cluster = plural category, community = plural sub-family, hub = singular subject).
  - `EncyclopediaClassifySchema` gains an optional `community` label; classification docs now describe topic as the singular hub tier.
  - `memoryPartitionRememberSchema` gains optional `community` (≤60 chars) and `subject` (≤40 chars) fields — the remember tool routes a fact into the full hierarchy (category → community → subject), and the tool description + memory-write prompt teach pick-first reuse of existing labels.

- ec0d0a5: Phase C of the MEMLEX plan — persistent `memory-encyclopedia` retrieval:

  - **Remove `compactContent` from `ToolDependencies`** — it was dead (no tool called it) and its internal `.slice(0, 8000)` + generative summary is the anti-pattern this plan eliminates. Callers no longer need to wire it.
  - **Extend the encyclopedia select contract** (`EncyclopediaSelectInput`/`EncyclopediaSelectResult`):
    - `EncyclopediaSelectInput.partitionScope?` — provenance recorded on stored chunks (the encyclopedia itself is global).
    - `EncyclopediaSelectResult.pastChunks?` — neighbor-expanded verbatim passages from previously persisted sources (the past-research lane).
    - `EncyclopediaSelectResult.reusedDocs?` / `storedDocs?` — read-through cache accounting.

- ec0d0a5: Memory taxonomy and enrichment:

  - `ExtractionSchema` gains an optional `category` field — one broad **plural family noun** (e.g. `stocks`, `games`) that groups the narrow tags into a topic family for the constellation's community tier and the relink job's per-category passes.
  - `buildExtractionPrompt` and `buildMemoryWritePrompt` now accept the partition's existing category/tag vocabulary and inject a reuse-first vocabulary section, so the model extends the taxonomy instead of minting near-duplicates.
  - New `MemoryEnrichmentSchema` + `buildEnrichPrompt` for the relink job's optional tag-refinement step (2–6 stable lowercase topic labels per record).

- 4a03c4d: Taxonomy discipline hardening across every tier-labeling surface (extract, remember/memory-write, encyclopedia classify):

  - New absolute PERSONA & FICTION rule: content about an adopted persona, a roleplay, or a fictional/entertainment work classifies by its real-world MEDIUM (cluster e.g. `shows`, community a true plural sub-family like `tv-shows`, hub the work's title or persona name) — never by in-universe domains (`family`, `education`, `business`, `science` describe reality, not an invented life).
  - Community-tier discipline reinforced with the counter-example: a show/work title like `breaking-bad` is a tag or a hub, never a community.

- 3fc42b2: Refine and consolidate the prompt system:

  - Image-task redesign (describe/compare/ocr): cloud reference candidates are now pure search-result DATA — the respond model picks evidence by textual corroboration (title/snippet/source vs. its own reading of the uploads) and never receives candidate pixels. The uploaded images still travel as attachments and still never enter the response gallery; unpicked candidates stay auditable in `discardedReferences`. Aligns `image-task-rule`, the compare/describe/ocr instructions, the correction prompt, and the intent prompt's fan-out/image-self-analysis wording with this contract.
  - `buildContentSystemPrompt` no longer repeats SECURITY/NOISE/MULTIMODAL rules — the base system message is their single carrier through the pipeline.
  - Split the intent-selection monolith into composed section modules (`harness/intent-selection/`), with one language-rules builder, one final reminder, and the AVAILABLE TEMPLATES list derived from `TEMPLATE_VARIANTS` (the stockmarket pair can no longer go missing).
  - New shared constants: `DEFAULT_MEDIA_COUNT`/`MORE_MEDIA_COUNT` and `EMBEDDABLE_VIDEO_PROVIDER_LABELS`/`EMBEDDABLE_VIDEO_PROVIDER_CLAUSE` (schemas), interpolated across intent/execute/structured prompts and tool descriptions so prose cannot drift from pipeline behavior. New `IMAGE_TASK_TEMPLATES`/`isImageTaskTemplate` in schemas.
  - New shared helpers: `buildVocabularySection` and `formatProvenanceLine` (memory prompts), replacing three verbatim copies.
  - New harness prompt builders absorbed from the apps: `buildToolExecutePrompt`, `buildImageExecutePrompt`, `buildExecuteLanguageInstruction`, `buildStockmarketNote`, `buildMissingToolsPrompt`, `buildCorrectionPrompt`, `buildMergeDirective`, `buildClassifyTranscript`, `buildMemoryProbeSection`, `buildClarificationTranslationSystemPrompt`/`buildClarificationTranslationUserPrompt`, `formatCurrentTimestamp`.
  - New memory prompts absorbed from the memory app: `BELIEF_INSTRUCTIONS` + `buildBeliefSynthesisPrompt`, `FRICTION_INSTRUCTIONS` + `buildFrictionPrompt`, `buildEncyclopediaClassifyPrompt`, and the `EncyclopediaClassifySchema` in schemas.
  - PRECEDENCE rules now name the sections that actually exist in the respond prompt.
  - Removed the dead `formatToolCatalog` helper and the redundant `TEMPLATE_VARIANTS` re-export.

- 3fc42b2: Encyclopedia research triage contract for the gap-filling maintenance job.

  - **New schema:** `ResearchTriageSchema` / `ResearchTriageDecisionSchema` — the structured verdict the research job's LLM fills per gap candidate (`close`, `reason`, optional `followUpTopics` for the next deep-dive).
  - **New prompt:** `RESEARCH_TRIAGE_INSTRUCTIONS` + `buildResearchTriagePrompt` — the triage system/user prompt pair, mirroring the cluster-summary prompt style.
  - **New export:** `extractArticleText` (web-fetch helper) is now public so the memory app's research job can reuse the same readability/turndown extraction as the web-fetch tool.

### Patch Changes

- ec0d0a5: Bump the `ai` peer dependency to `^7.0.83` to align the `Tool`/`ToolSet` types with the server's `ai@7.0.83`. The previous `^7.0.79` resolved to `@ai-sdk/provider-utils@5.0.30`, whose `Tool` type is incompatible with `5.0.32` (used by `ai@7.0.83`), breaking the server's type-check when it passed the agent's tool factories to `withSummary`.
- 3fc42b2: Encyclopedia classify prompt: the topic is the document's main subject entity.

  - **Prompt tightening:** the topic rule now pins classification to the title-level entity (never a sub-part — a chapter, location, single feature — and never an adjacent proper noun like a publisher or related event), and the category labels the topic's family rather than any side theme. Reduces taxonomy drift where a chunk about one district or one corporate announcement would mint its own topic/category instead of joining the document's main subject (observed live: "travel" / "hethereau districts" fragments next to "games" / "neverness to everness").

- ec0d0a5: Two-tier encyclopedia — the encyclopedia now remembers every source touched, not just the fetched pages:

  - **`EncyclopediaSelectInput.searchResults?`** — search results seen this turn, indexed as cheap Tier-1 snippet points (no page fetch, no link graph) so future turns can recall sources that were searched but never fetched.
  - **`EncyclopediaSelectedChunk.sourceType?`** — `content` (fetched-document chunk) vs `result` (search-result snippet), so the harness can frame past-research context correctly (full text vs snippet).
  - **FETCH-AFTER-SEARCH RULES** now instruct the model to fetch the most relevant result pages (not a fixed 1–3) and to prefer primary/readable sources over app stores, forums, and discussion threads.

- ec0d0a5: Lane-qualified memory tools and an unbounded episode probe limit.

  - **Tool renames (breaking):** `memoryRemember` → `memory-partition-remember`, `memoryRecall` → `memory-partition-recall`, and `memoryDelete` is split into `memory-partition-delete` (verbatim fact delete) and `memory-cognition-forget` (cognition-space wipe). `MEMORY_TOOL_NAMES` and `TOOL_NAMES` now carry the five lane-qualified names.
  - **New tool:** `memory-cognition-remember` stores one derived insight into the AI's cognition space (`{text, path?}`), so the model can route its own understanding of the user separately from stated facts.
  - **`EPISODE_PROBE_LIMIT_MAX` removed** and `EPISODE_PROBE_LIMIT_MIN` lowered to `0` — the episode probe limit is now unbounded above zero (`clampEpisodeProbeLimit` floors at 0; 0 disables the probe).
  - **Prompts:** the intent-selection MEMORY RULES, the memory-write job, and the vectorize extraction prompt now teach the partition/cognition lane split and are more eager about durable user data.

- 3fc42b2: Contested-memory query contract for the gap-filling researcher: open frictions become resolution-seeking searches.

  - **New schema:** `ResearchFrictionQuerySchema` / `ResearchFrictionQueryDecisionSchema` — the structured verdict the model fills per contested pair (`checkable`, optional resolution-seeking `query`).
  - **New prompt:** `RESEARCH_FRICTION_QUERY_INSTRUCTIONS` + `buildResearchFrictionQueryPrompt` — decides which contradictions a web search can settle and formulates the evidence-seeking query; subjective disputes are declined and stay with the reflection cycle. Mirrors the research triage prompt style.
  - **New prompt:** `buildSynopsisProbeSection` — renders the Raptor community-synopsis hits (cluster summaries at any hierarchy level) as an interpret-probe block, next to the fact probe, episode probe, and cognition profile.

- Updated dependencies [ec0d0a5]
- Updated dependencies [be7ff5f]
- Updated dependencies [36adb77]
- Updated dependencies [4a03c4d]
  - @triplef/helpers@1.6.0
