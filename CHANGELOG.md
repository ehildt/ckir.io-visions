# @ckir.io/visions

## 1.2.0

### Minor Changes

- d8dd5ff: Rename `batchId` to `requestId` for better semantics

  - Add `requestId` query parameter to REST and MCP endpoints
  - REST endpoint now returns `{ realtime: { event, roomId, requestId } }` response matching MCP
  - Create shared `RealtimeInfo` DTO used by both REST and MCP responses
  - Update Swagger documentation with response schema

### Patch Changes

- 483e519: Sync wiki documentation with source code

  - Fixed incorrect default values in system-environment.md (PORT, NODE_ENV, OLLAMA_KEEP_ALIVE, BULLMQ_JOB_PRIORITY, age values)
  - Removed non-existent SOCKET_IO_PORT from documentation
  - Updated docker-compose.md with correct ports, network name, and volumes
  - Fixed header name casing and error status codes
  - Updated Socket.IO connection URL and MCP tool schema

- 483e519: move AGENTS.md and EXTEND.md to .opencode directory

## 1.1.0

### Minor Changes

- e6d70cd: ## MCP & Wiki Improvements

  ### MCP Fixes

  - Fixed MCP validation to accept `params.name` (MCP spec standard) instead of `params.function`
  - Changed MCP prompt from plain string to `Prompt[]` array format (matches REST API)
  - Updated controller and DTOs to handle both formats correctly

  ### Wiki Updates

  - Added comprehensive REST API documentation with task types: describe, compare, ocr
  - Added MCP documentation with JSON-RPC payload examples for all tools
  - Fixed query parameter documentation (moved `task` from query to body)
  - Added Swagger examples for both REST and MCP endpoints
  - Updated required fields in tool schema from `["images", "prompt", "task"]` to `["task"]`
  - Added complete `.env` example with all variables (optional ones commented)
  - Added compose.yml example with optional GPU support commented

  ### Code Quality

  - Added tests for MCP payload validation including name parameter and Prompt array format
  - Fixed linter errors in validation pipe and DTOs

### Patch Changes

- d18f592: Add tests for improved coverage: config adapters, pipes, and services
