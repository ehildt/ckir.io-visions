---
"@ckir.io/visions": minor
---

## MCP & Wiki Improvements

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
