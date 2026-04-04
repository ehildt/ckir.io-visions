# MCP (Model Context Protocol)

The MCP endpoint implements the Model Context Protocol using JSON-RPC 2.0 transport.

## Endpoint

```
POST /mcp
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `x-vision-llm` | Yes | Ollama model name (e.g., `llama3.2-vision`) |

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `requestId` | Yes | Request correlation identifier |
| `event` | No | Socket.IO event name (default: `vision`) |
| `stream` | No | Enable streaming responses |
| `roomId` | No | Socket.IO room for real-time results |
| `numCtx` | No | Context window size for the model |

### Body (multipart/form-data)

| Field | Required | Description |
|-------|----------|-------------|
| `images` | Yes* | Image files (PNG, JPG, JPEG, WEBP) |
| `payload` | Yes | JSON-RPC request |

*Required for `tools/call`; not required for `tools/list`

## JSON-RPC Methods

### initialize

Initialize the MCP server connection. Returns server capabilities and info.

**Query Parameters:**
- `requestId` (required)

**Payload:**

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-11-25",
    "capabilities": {},
    "clientInfo": { "name": "my-client", "version": "1.0.0" }
  },
  "id": 0
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 0,
  "result": {
    "protocolVersion": "2025-11-25",
    "capabilities": { "tools": { "listChanged": false } },
    "serverInfo": { "name": "@ckir.io/visions", "version": "1.1.0" }
  }
}
```

> Note: `serverInfo.name` and `serverInfo.version` are dynamically read from `package.json`.

---

### tools/list

List available MCP tools. No images required.

**Query Parameters:**
- `requestId` (required)

**Payload:**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "title": "Vision Analysis",
        "name": "visions.analyze",
        "description": "Perform a specific visual analysis on provided images based on the selected task: description, comparison, or optical character recognition (OCR).",
        "inputSchema": {
          "type": "object",
          "additionalProperties": false,
          "required": ["images", "prompt", "task"],
          "properties": {
            "prompt": {
              "type": "string",
              "description": "Optional textual instruction to guide the selected vision task. For example, provide context or specify what to focus on during analysis."
            },
            "task": {
              "type": "string",
              "default": "describe",
              "description": "Specifies which type of analysis to perform. Only one task is executed per request: \"describe\": generates a description of the image content. \"compare\": evaluates similarities or differences between images. \"ocr\": extracts text content from the images.",
              "enum": ["describe", "compare", "ocr"]
            }
          }
        }
      }
    ]
  }
}
```

---

### visions.analyze

Perform image analysis.

**Headers:**
- `x-vision-llm` (required)

**Query Parameters:**
- `requestId` (required)

**Payload:**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "describe",
      "prompt": [{"role": "user", "content": "What do you see?"}]
    }
  },
  "id": 2
}
```

**Arguments:**

| Argument | Type | Required | Description |
|-----------|------|----------|-------------|
| `task` | string | Yes | Task type: `describe`, `compare`, or `ocr` |
| `prompt` | array | No | Array of Prompt objects `[{"role": "user", "content": "..."}]` |

---

## Task Types

### describe

Generate a description of the image content.

**Example Payload:**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "describe"
    }
  },
  "id": 1
}
```

---

### compare

Evaluate similarities or differences between multiple images.

**Example Payload:**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "compare"
    }
  },
  "id": 2
}
```

---

### ocr

Extract text content from images.

**Example Payload:**

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "ocr"
    }
  },
  "id": 3
}
```

---

## MCP Response Flow

The MCP protocol is real-time via Socket.IO. When you call `tools/call`:

1. The server queues the image processing task
2. Returns an immediate MCP response with `realtime` info
3. Subscribe to Socket.IO for live results

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Processing started. Connect to Socket.IO for real-time results."
      }
    ],
    "isError": false,
    "realtime": {
      "event": "vision",
      "roomId": "optional-room-id",
      "requestId": "batch-001"
    }
  }
}
```

The `realtime` object contains:
- `event`: Socket.IO event name (default: `vision`)
- `roomId`: Room ID for subscribing to results (if provided)
- `requestId`: Batch identifier for tracking

---

## Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Invalid JSON-RPC payload |
| `422 Unprocessable Entity` | Missing required parameters |

---

## Swagger Examples

### List available tools

**Query Parameters:**
- `requestId`: `1234`

**Body (multipart/form-data):**
- `payload`:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

---

### Describe an image

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `requestId`: `1234`

**Body (multipart/form-data):**
- `images`: (image file)
- `payload`:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "describe"
    }
  },
  "id": 2
}
```

---

### Compare images

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `requestId`: `5678`

**Body (multipart/form-data):**
- `images`: (multiple image files)
- `payload`:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "compare"
    }
  },
  "id": 3
}
```

---

### OCR

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `requestId`: `9012`

**Body (multipart/form-data):**
- `images`: (image file)
- `payload`:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "ocr"
    }
  },
  "id": 4
}
```

---

### Describe with custom prompt

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `requestId`: `3456`

**Body (multipart/form-data):**
- `images`: (image file)
- `payload`:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "visions.analyze",
    "arguments": {
      "task": "describe",
      "prompt": [{"role": "user", "content": "What colors do you see?"}]
    }
  },
  "id": 5
}
```
