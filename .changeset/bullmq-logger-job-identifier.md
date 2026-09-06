---
'@triplef/bullmq-logger': minor
---

Optional job identifier in the log line.

- `log` / `error` / `warn` / `debug` / `verbose` now accept an optional `identifier` that renders as `📌 <identifier>` after the job id, so payload-scoped jobs (e.g. `memory-reflect` lane/scope) stay identifiable even when BullMQ assigns a numeric id or a DLQ reinstatement drops the original jobId.
- `error` also emits the identifier as a structured field for JSON-log filtering.
