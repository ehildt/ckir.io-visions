---
'@triplef/helpers': patch
---

Fix `TextToLines` sentence splitting mangling URLs, hosts, and file paths: Western terminators (`.`, `?`, `!`, `...`) now only end a sentence when followed by whitespace or the end of the string, so `en.wikipedia.org/wiki/X`, `v3.5.1`, and `.env.local` are never split mid-token. CJK punctuation (`。`, `？`, `！`, `…`) keeps splitting unconditionally — CJK text does not mark boundaries with spaces.

This repairs the encyclopedia chunking pipeline (`chunkTextBySentences` rejoins sentences with spaces and previously corrupted every dotted URL on ingest, e.g. `https://en. wikipedia. org/wiki/X`) and the memory search query-variant builder, which shares the splitter.
