# REST API Architecture

This document describes the architectural flow of the REST API implementation.

## Overview

The REST API provides a multipart/form-data endpoint for image analysis, using Socket.IO for real-time results.

```mermaid
flowchart TD
    subgraph Client["REST Client"]
        C[HTTP Client]
    end

    subgraph Server["@ckir.io/visions"]
        subgraph Controller["ClassicController"]
            VS[visionStream<br/>/vision]
        end

        subgraph Service["AnalyzeImageService"]
            FP[toFilePayloads]
            EM[emit]
        end

        subgraph Queue["BullMQ Queues"]
            Q1[describe]
            Q2[compare]
            Q3[ocr]
        end

        subgraph Workers["Vision Processors"]
            WP1[VisionsDescribeProcessor]
            WP2[VisionsCompareProcessor]
            WP3[VisionsOCRProcessor]
        end

        subgraph Processor["VisionsProcessor"]
            HV[handleVision]
            ES[emitToSocket]
        end
    end

    subgraph Ollama
        O1[llama3.2-vision]
    end

    subgraph SocketIO["Socket.IO"]
        SI[Emit Results]
    end

    C -->|"POST /vision<br/>multipart/form-data"| VS
    VS --> FP
    FP --> EM
    EM -->|"emit to queue"| Q1
    EM -->|"emit to queue"| Q2
    EM -->|"emit to queue"| Q3

    Q1 --> WP1
    Q2 --> WP2
    Q3 --> WP3

    WP1 --> HV
    WP2 --> HV
    WP3 --> HV

    HV -->|"ollamaService.chat"| O1
    O1 -->|"response"| HV

    HV --> ES
    ES -->|"emit to room"| SI

    SI -->|"real-time"| C
```

## Request Flow

### 1. Client sends REST request

```
POST /vision?requestId=1234&roomId=room-123&stream=true
Content-Type: multipart/form-data
x-vision-llm: llama3.2-vision

--boundary
Content-Disposition: form-data; name="task"
describe
--boundary
Content-Disposition: form-data; name="prompt"
[{"role": "user", "content": "Describe this image"}]
--boundary
Content-Disposition: form-data; name="images"; filename="photo.jpg"
<image data>
--boundary--
```

### 2. Controller processes request

```typescript
async visionStream(
  @Query(REQUEST_ID) requestId: string,
  @Headers(X_VISION_LLM) vLLM: string,
  @MultiPartValue(TASK) task: MultipartValue<VisionTask>,
  @MultiPartFiles() images?: Array<MultipartFile>,
): Promise<ClassicControllerResponse> {
  // 1. Convert images to buffers
  const results = await this.analyzeImageService.toFilePayloads(requestId, images);

  // 2. Emit to BullMQ queue
  void this.analyzeImageService.emit({ buffers, meta, filters });

  // 3. Return realtime info
  return { realtime: { event, roomId, requestId } };
}
```

## Response Flow

### REST Response (HTTP 202)

```mermaid
sequenceDiagram
    participant C as REST Client
    participant S as Server
    participant Q as BullMQ Queue
    participant W as Vision Worker
    participant O as Ollama
    participant SI as Socket.IO

    C->>S: POST /vision (multipart/form-data)
    S->>Q: Emit to queue (describe/compare/ocr)
    S-->>C: 202 Accepted + realtime info
    
    Q->>W: Process job
    W->>O: Call vision model
    O-->>W: Return analysis
    W->>SI: Emit result to room
    
    SI-->>C: Real-time results via Socket.IO
```

```json
{
  "realtime": {
    "event": "vision",
    "roomId": "room-123",
    "requestId": "1234"
  }
}
```

### Socket.IO Real-time Results

```json
{
  "meta": [
    {
      "name": "photo.jpg",
      "type": "image/jpeg",
      "hash": "abc123...",
      "requestId": "1234"
    }
  ],
  "task": "describe",
  "message": {
    "role": "assistant",
    "content": "The image shows a cat sitting on a windowsill..."
  },
  "done": false
}
```

## Key Components

| Component | Description |
|------------|-------------|
| `ClassicController` | Handles HTTP requests, processes multipart uploads |
| `AnalyzeImageService` | Image processing, queue dispatch |
| `VisionsDescribeProcessor` | BullMQ processor for describe task |
| `VisionsCompareProcessor` | BullMQ processor for compare task |
| `VisionsOCRProcessor` | BullMQ processor for OCR task |
| `VisionsProcessor` | Base class with `handleVision` and `emitToSocket` |
| `OllamaService` | Wrapper around Ollama API |
| `Socket.IO` | Real-time result streaming |

## Data Structures

### Realtime Info

The `realtime` object is returned in the REST response:

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Socket.IO event name (default: `vision`) |
| `roomId` | string? | Room ID for subscribing to results |
| `requestId` | string | Client-provided request correlation ID |

### Filters

Passed through to workers for processing:

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Request correlation ID |
| `roomId` | string? | Socket.IO room |
| `stream` | boolean | Enable streaming |
| `numCtx` | number? | Model context size |
| `vLLM` | string | Ollama model name |
| `task` | string | Task type: `describe`, `compare`, `ocr` |
| `prompt` | array? | Prompt messages |

## Comparison: REST vs MCP

| Feature | REST API | MCP |
|---------|----------|-----|
| Endpoint | `/vision` | `/mcp` |
| Content-Type | multipart/form-data | multipart/form-data |
| Request Format | Form fields | JSON-RPC payload |
| Task via | `task` field | `arguments.task` |
| Prompt via | `prompt` field | `arguments.prompt` |
| Response | `{ realtime: {...} }` | `{ result: { realtime: {...} } }` |
