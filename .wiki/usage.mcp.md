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
| `batchId` | Yes | Unique batch identifier |
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

### tools/list

List available MCP tools. No images required.

**Query Parameters:**
- `batchId` (required)

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
        "name": "visions.analyze",
        "description": "Perform a specific visual analysis on provided images based on the selected task: description, comparison, or optical character recognition (OCR).",
        "inputSchema": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "prompt": {
              "type": "array",
              "description": "Optional array of Prompt objects to guide the vision task"
            },
            "task": {
              "type": "string",
              "default": "describe",
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
- `batchId` (required)

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

## Socket.IO Response

Results are emitted via Socket.IO event (default: `vision`):

```json
{
  "meta": [
    {
      "name": "image.jpg",
      "type": "image/jpeg",
      "hash": "abc123...",
      "batchId": "batch-001"
    }
  ],
  "task": "describe",
  "message": {
    "role": "assistant",
    "content": "Analysis result..."
  }
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Invalid JSON-RPC payload |
| `422 Unprocessable Entity` | Missing required parameters |

---

## Swagger Examples

### List available tools

**Query Parameters:**
- `batchId`: `1234`

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
- `batchId`: `1234`

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
- `batchId`: `5678`

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
- `batchId`: `9012`

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
- `batchId`: `3456`

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
