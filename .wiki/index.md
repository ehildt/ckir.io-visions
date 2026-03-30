<h1 align="center">@CKIR.IO/VISIONS</h1>

<strong>@CKIR.IO/VISIONS</strong> allows uploading one or more images (PNG, JPG, JPEG, WEBP) and supports AI-driven description, comparison and text extraction via OCR. It exposes multiple REST endpoints and implements the Model Context Protocol (MCP) using the JSON‑RPC 2.0 transport.

## Features

- **Image Description** - AI-powered image analysis and description
- **Image Comparison** - Compare multiple images and identify differences
- **OCR** - Extract text from images using vision models
- **REST API** - Simple multipart upload endpoint
- **MCP Protocol** - Model Context Protocol support with JSON-RPC 2.0
- **Real-time Results** - Socket.IO for streaming responses

## Installation

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm start:dev
```

## Documentation

- [REST API](usage.rest-api) - Multipart endpoint with task types: `describe`, `compare`, `ocr`
- [MCP](usage.mcp) - JSON-RPC 2.0 endpoint with `tools/list` and `visions.analyze` tool
- [Socket.IO](usage.socket-io) - Real-time streaming of analysis results
- [Docker Compose](docker-compose) - Docker setup
- [System Environment](system-environment) - Environment variables
