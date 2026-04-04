# MCP Implementation Plan

## Architecture
- Keep `/mcp` endpoint for MCP protocol
- Implement `initialize` handshake
- Return MCP-compliant JSON-RPC responses immediately after Socket.IO emit
- Include event name and room info in response for real-time tracking

---

## TODO

### Step 1: Add MCP Protocol Constants
- Create `src/constants/mcp.constants.ts`
- Define `MCP_PROTOCOL_VERSION` (e.g., `"2025-11-25"`)
- Define `MCP_CAPABILITIES` object

### Step 2: Implement `initialize` Handler
- Add to `JsonRpcService` or create new service
- Accept `protocolVersion`, `capabilities`, `clientInfo` from request
- Return `protocolVersion`, `capabilities`, `serverInfo`:
  ```json
  {
    "protocolVersion": "2025-11-25",
    "capabilities": { "tools": { "listChanged": false } },
    "serverInfo": { "name": "visions", "version": "1.1.0" }
  }
  ```

### Step 3: Update `tools/list` Response
- Add `protocolVersion` to result
- Add `capabilities` to result

### Step 4: Update `tools/call` Response Format
- Change to MCP-compliant structure:
  ```json
  {
    "content": [{ "type": "text", "text": "..." }],
    "isError": false,
    "realtime": {
      "event": "vision",
      "roomId": "optional-room-id",
      "batchId": "batch-001"
    }
  }
  ```
- Inject `SocketIOConfigService` to get event name
- Include `filters.roomId` and `filters.batchId` in response

### Step 5: Update Tool Definition (Optional)
- Add `title: "Vision Analysis"` to `VISIONS_ANALYZE`
- Keep existing `inputSchema`

### Step 6: Update Documentation
- Update `.wiki/usage.mcp.md`
- Document that MCP is real-time via Socket.IO
- Explain `realtime` field in response

---

## MCP Response Flow
```
Client → MCP /mcp (tools/call) → Server
       ↳ emit to Socket.IO (async, real-time)
       ↳ return MCP response with event/room info
Client subscribes to Socket.IO for results
```