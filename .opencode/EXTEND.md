# MCP Implementation Plan

## Architecture
- Keep `/mcp` endpoint for MCP protocol
- Implement `initialize` handshake (required by MCP spec)
- Return MCP-compliant JSON-RPC responses immediately after Socket.IO emit
- Include event name and room info in response for real-time tracking

---

## Decisions (Based on MCP Spec Review)

### initialize vs tools/list
- **`initialize`** - Returns `protocolVersion`, `capabilities`, `serverInfo` (required by MCP spec)
- **`tools/list`** - Returns only `tools` array (per MCP spec)
- Removed `protocolVersion` and `capabilities` from `tools/list` - they were redundant

### Why keep initialize?
Per MCP spec: "The initialization phase **MUST** be the first interaction between client and server"
- Required for capability negotiation
- Required by MCP clients (Claude Desktop, etc.)

---

## TODO

### Step 1: Add MCP Protocol Constants ✅ COMPLETED
- Create `src/constants/mcp.constants.ts` ✅
- Define `MCP_PROTOCOL_VERSION` ("2025-11-25") ✅
- Define `MCP_CAPABILITIES` object ✅

### Step 2: Implement `initialize` Handler ✅ COMPLETED
- Add to `JsonRpcService` ✅
- Read `package.json` dynamically for `serverInfo.name` and `serverInfo.version` ✅
- Return `protocolVersion`, `capabilities`, `serverInfo` ✅

### Step 3: Update `tools/list` Response ✅ COMPLETED
- Returns only `tools` array ✅
- Removed redundant `protocolVersion` and `capabilities` (now only in initialize) ✅

### Step 4: Update `tools/call` Response Format ✅ COMPLETED
- Change to MCP-compliant structure ✅
- Inject `SocketIOConfigService` to get event name ✅
- Include `filters.roomId` and `filters.batchId` in response ✅

### Step 5: Update Tool Definition (Optional) ✅ COMPLETED
- Add `title: "Vision Analysis"` to `VISIONS_ANALYZE` ✅
- Keep existing `inputSchema` ✅

### Step 6: Update Documentation ✅ COMPLETED
- Update `.wiki/usage.mcp.md` ✅
- Document that MCP is real-time via Socket.IO ✅
- Explain `realtime` field in response ✅

---

## MCP Response Flow
```
Client → MCP /mcp (initialize) → Server
        ↳ returns capabilities + serverInfo
Client → MCP /mcp (tools/list) → Server
        ↳ returns tools
Client → MCP /mcp (tools/call) → Server
        ↳ emit to Socket.IO (async, real-time)
        ↳ return MCP response with event/room info
Client subscribes to Socket.IO for results
```