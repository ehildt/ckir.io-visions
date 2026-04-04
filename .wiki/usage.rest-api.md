# REST API

The REST API provides a simple multipart endpoint for image analysis.

## Endpoint

```
POST /vision
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
| `stream` | No | Enable streaming responses (default: `false`) |
| `roomId` | No | Socket.IO room for real-time results |
| `numCtx` | No | Context window size for the model |

### Body (multipart/form-data)

| Field | Required | Description |
|-------|----------|-------------|
| `images` | Yes | Image files (PNG, JPG, JPEG, WEBP) |
| `task` | Yes | Task type: `describe`, `compare`, or `ocr` |
| `prompt` | No | Additional prompt to send to the model |

## Response

Returns `202 Accepted` immediately. Results are streamed via Socket.IO.

### Socket.IO Event: `vision` (configurable via `SOCKET_IO_EVENT`)

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
    "content": "This image shows a cat sitting on a windowsill..."
  }
}
```

## Task Types

### describe

Generate a description of the image content.

**Query Parameters:**
- `batchId` (required)

**Body Fields:**
- `task`: `describe`

---

### compare

Evaluate similarities or differences between multiple images.

**Query Parameters:**
- `batchId` (required)

**Body Fields:**
- `task`: `compare`
- `images`: multiple image files

---

### ocr

Extract text content from images.

**Query Parameters:**
- `batchId` (required)
- `stream` (optional)

**Body Fields:**
- `task`: `ocr`

---

## Swagger Examples

### Describe an image

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `batchId`: `1234`

**Body (multipart/form-data):**
- `task`: `describe`
- `images`: (image file)

---

### Compare images

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `batchId`: `5678`

**Body (multipart/form-data):**
- `task`: `compare`
- `images`: (multiple image files)

---

### OCR with streaming

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `batchId`: `9012`
- `stream`: `true`

**Body (multipart/form-data):**
- `task`: `ocr`
- `images`: (image file)

---

### Describe with custom prompt

**Headers:**
- `x-vision-llm`: `llama3.2-vision`

**Query Parameters:**
- `batchId`: `3456`

**Body (multipart/form-data):**
- `task`: `describe`
- `prompt`: `[{"role": "user", "content": "What colors do you see?"}]`
- `images`: (image file)

---

## Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Missing required parameters or invalid image format |
| `400 Bad Request` | Missing `x-vision-llm` header |
