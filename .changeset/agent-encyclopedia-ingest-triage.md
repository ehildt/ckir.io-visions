---
'@triplef/agent': minor
---

Encyclopedia ingest triage contract — the LLM gate that keeps the knowledge base on-topic.

- **New schema:** `EncyclopediaIngestTriageSchema` / `EncyclopediaIngestTriageDecisionSchema` — the structured verdict (`index`, `keep`, `reason`) the memory app fills per gathered candidate before persisting.
- **New prompt:** `ENCYCLOPEDIA_INGEST_TRIAGE_INSTRUCTIONS` + `buildEncyclopediaIngestTriagePrompt` — the triage system/user prompt pair, mirroring the research-triage prompt style.
- **Docs:** corrected the `EncyclopediaSelectInput.searchResults` comment — persistence is triage-gated, no longer "remembers every source touched".
