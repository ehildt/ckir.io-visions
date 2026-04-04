# Socket.IO

Socket.IO is used for real-time streaming of analysis results. The event name is configurable via the `SOCKET_IO_EVENT` environment variable (default: `vision`).

## Configuration

| Environment Variable | Default | Description |
|----------------------|---------|-------------|
| `SOCKET_IO_EVENT` | `vision` | Socket.IO event name |
| `SOCKET_IO_TRANSPORTS` | `websocket,polling,webtransport` | Allowed transport protocols |

**Note:** Socket.IO runs on the same port as the main HTTP server (default: 3000).

## Connection

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});
```

## Subscribing to Results

### Join Room (Optional)

If you specified a `roomId` in your request, join that room to receive results:

```javascript
socket.emit("join", "your-room-id");
```

### Listen for Results

```javascript
socket.on("vision", (data) => {
  console.log(data);
});
```

## Response Format

### Stream Mode

Each chunk is emitted as it arrives:

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
  "done": false,
  "message": {
    "role": "assistant",
    "content": "This image shows..."
  }
}
```

### Non-Stream Mode

Single response with complete content:

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
    "content": "This image shows a cat sitting on a windowsill looking outside. The cat appears to be a domestic shorthair with orange and white coloring..."
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `meta` | array | Array of image metadata (name, type, hash, batchId) |
| `task` | string | Task type: `describe`, `compare`, or `ocr` |
| `message` | object | Response from the model |
| `message.role` | string | Always `assistant` |
| `message.content` | string | The model's response text |
| `done` | boolean | Only in stream mode - indicates if this is the final chunk |

## Error Handling

Socket errors are logged but don't throw exceptions. The service will continue processing.

```javascript
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});
```