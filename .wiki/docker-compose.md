# Docker Compose

Use this example docker-compose.yml to run the visions service along with its dependencies (Ollama and KeyDB/Redis).

## Prerequisites

- Docker with GPU support (for Ollama)
- NVIDIA GPU with container support (optional, for GPU acceleration)

## Example compose.yml

```yml
services:
  visions:
    container_name: visions
    restart: on-failure
    build:
      context: ./
      target: local
    volumes:
      - ./:/app
      - ./node_modules:/node_modules:ro
    depends_on:
      - keydb
    env_file:
      - ./.env
    environment:
      - NODE_ENV=local
      - PRINT_CONFIG=true
      - ENABLE_SWAGGER=true
    ports:
      - 3000:3000
    networks:
      - ckir.io-visions

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    gpus: all
    environment:
      - OLLAMA_HOST=0.0.0.0
    restart: unless-stopped
    networks:
      - ckir.io-visions

  keydb:
    image: eqalpha/keydb
    container_name: keydb
    restart: on-failure
    ports:
      - 6379:6379
    volumes:
      - keydb_data:/data
      - ./keydb.conf:/usr/local/etc/keydb/keydb.conf
    command: keydb-server /usr/local/etc/keydb/keydb.conf
    networks:
      - ckir.io-visions

volumes:
  ollama:
  keydb_data:

networks:
  ckir.io-visions:
    name: ckir.io-visions
    driver: bridge
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| `visions` | 3000 (HTTP/Socket.IO) | Main application |
| `ollama` | 11434 | Ollama AI server |
| `keydb` | 6379 | KeyDB (Redis-compatible) for job queue |

## Running

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## Ollama Models

After starting, pull the vision model you want to use:

```bash
docker exec -it ollama pull llama3.2-vision
```

## Environment

Make sure your `.env` file is configured. Key variables:

```bash
# Ollama
OLLAMA_HOST=http://ollama:11434

# BullMQ (KeyDB)
BULLMQ_HOST=keydb
BULLMQ_PORT=6379
```