# @triplef/memory

## 1.1.0

### Minor Changes

- ec0d0a5: - **Encyclopedia persistence**: new `memory-encyclopedia` collection stores verbatim chunks of fetched sources (deterministic `url|contentHash|chunkIndex` ids, global scope with `partitionScope` provenance, `content`/`result` source types), plus a encyclopedia sweep job and read-through cache accounting.
  - **Relink job**: LLM-based link enrichment — recomputes memory links, refines record tags via the new enrichment prompt, and adjudicates consolidation verdicts per category.
  - **Cognition space**: `memory-cognition` service + insights endpoint (`POST /memory/cognition/insights`) and the `memory-cognition-forget` wipe.
  - **Vocabulary endpoint**: `GET /memory/vocabulary` facets the partition's existing categories/tags so the write/extract prompts can reuse them.
  - **Constellation node limit**: server-global `constellationNodeLimit` override (default 5000) caps the memory list query.
- bbe382d: Migrated both apps from their local `pino-logger` modules to the published `@triplef/core-logger` package:

  - Replaced `PinoLoggerService`/`PinoLoggerModule` with `CoreLoggerService`/`CoreLoggerModule.registerAsync`, wired through a new app-level `CoreLoggerConfigService` (`@CacheReturnValue(CoreLoggerSchema)`).
  - Logging now renders the NestJS context inline as `[Context] message` (via the pino-pretty `messageFormat` + `ignore: 'pid,hostname,context'`), preserves error stacks, and supports `setLogLevels` and per-call `onLog` hooks.
  - Bumped `@triplef/config-factory` to `^1.1.4` (root export).
  - Removed the unused `json5` dependency.

### Patch Changes

- Updated dependencies [ec0d0a5]
- Updated dependencies [3fc42b2]
- Updated dependencies [3fc42b2]
- Updated dependencies [6d288c6]
- Updated dependencies [3fc42b2]
- Updated dependencies [3fc42b2]
- Updated dependencies [3fc42b2]
- Updated dependencies [ec0d0a5]
- Updated dependencies [3fc42b2]
- Updated dependencies [ec0d0a5]
- Updated dependencies [ec0d0a5]
- Updated dependencies [ec0d0a5]
- Updated dependencies [ec0d0a5]
- Updated dependencies [ec0d0a5]
- Updated dependencies [4a03c4d]
- Updated dependencies [3fc42b2]
- Updated dependencies [3fc42b2]
- Updated dependencies [3fc42b2]
- Updated dependencies [ec0d0a5]
- Updated dependencies [3fc42b2]
- Updated dependencies [ec0d0a5]
- Updated dependencies [3fc42b2]
- Updated dependencies [ec0d0a5]
- Updated dependencies [6d288c6]
- Updated dependencies [13383bb]
- Updated dependencies [ec0d0a5]
- Updated dependencies [be7ff5f]
- Updated dependencies [36adb77]
- Updated dependencies [4a03c4d]
- Updated dependencies [36adb77]
  - @triplef/agent@1.0.0
  - @triplef/ai-sdk@1.0.0
  - @triplef/bullmq-logger@1.3.0
  - @triplef/core-logger@1.0.0
  - @triplef/helpers@1.6.0
  - @triplef/config-factory@1.2.0
