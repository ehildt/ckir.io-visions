---
"@ckir.io/visions": minor
---

Rename `batchId` to `requestId` for better semantics

- Add `requestId` query parameter to REST and MCP endpoints
- REST endpoint now returns `{ realtime: { event, roomId, requestId } }` response matching MCP
- Create shared `RealtimeInfo` DTO used by both REST and MCP responses
- Update Swagger documentation with response schema
