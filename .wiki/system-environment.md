# System Environment

All configuration is done via environment variables. Create a `.env` file in the project root.

## Base

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `ADDRESS` | `0.0.0.0` | Server bind address |
| `NODE_ENV` | `development` | Node environment |
| `PRINT_CONFIG` | `true` | Print config on startup |
| `ENABLE_SWAGGER` | `true` | Enable Swagger/OpenAPI docs |
| `BODY_LIMIT` | `104857600` | Max request body size (100MB) |
| `LOG_LEVEL` | `log,warn,error` | Comma-separated log levels |

## Health

| Variable | Default | Description |
|----------|---------|-------------|
| `HEALTH_MEMORY_HEAP` | `256MB` | Heap memory threshold for health check |
| `HEALTH_MEMORY_RSS` | `256MB` | RSS memory threshold for health check |
| `HEALTH_DISK_PATH` | `/` | Disk path for health check |
| `HEALTH_DISK_THRESHOLD` | `0.8` | Disk usage threshold (0-1) |

## Cors

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGIN` | `*` | Allowed origins |
| `CORS_METHODS` | `GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE` | Allowed methods |
| `CORS_PREFLIGHT_CONTINUE` | `false` | Pass CORS preflight to handler |
| `CORS_OPTIONS_SUCCESS_STATUS` | `204` | Success status for OPTIONS |
| `CORS_CREDENTIALS` | `true` | Allow credentials |
| `CORS_ALLOWED_HEADERS` | `Content-Type,Accept,X-Vision-LLM` | Allowed headers |

## Socket.IO

| Variable | Default | Description |
|----------|---------|-------------|
| `SOCKET_IO_EVENT` | `vision` | Socket.IO event name |
| `SOCKET_IO_CONNECT_TIMEOUT` | `45000` | Connection timeout (ms) |
| `SOCKET_IO_MAX_HTTP_BUFFER_SIZE` | `262144` | Max HTTP buffer size |
| `SOCKET_IO_CLEANUP_EMPTY_CHILD_NAMESPACES` | `false` | Auto-cleanup empty namespaces |
| `SOCKET_IO_TRANSPORTS` | `websocket,polling,webtransport` | Allowed transports |
| `SOCKET_IO_CORS_ORIGIN` | `*` | CORS origin |
| `SOCKET_IO_CORS_CREDENTIALS` | `true` | CORS credentials |
| `SOCKET_IO_CORS_METHODS` | `GET,POST` | CORS methods |
| `SOCKET_IO_PING_INTERVAL` | `25000` | Ping interval (ms) |
| `SOCKET_IO_PING_TIMEOUT` | `5000` | Ping timeout (ms) |
| `SOCKET_IO_ALLOW_EIO3` | `false` | Allow Engine.IO v3 |

## BullMQ Connection

| Variable | Default | Description |
|----------|---------|-------------|
| `BULLMQ_HOST` | `keydb` | Redis/KeyDB host |
| `BULLMQ_PORT` | `6379` | Redis/KeyDB port |
| `BULLMQ_USER` | `default` | Redis username |
| `BULLMQ_PASS` | `redis` | Redis password |
| `BULLMQ_CONNECT_TIMEOUT` | `30000` | Connection timeout (ms) |
| `BULLMQ_COMMAND_TIMEOUT` | `30000` | Command timeout (ms) |

## BullMQ TLS (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `BULLMQ_USE_TLS` | `false` | Enable TLS |
| `BULLMQ_TLS_REJECT_UNAUTHORIZED` | `true` | Reject unauthorized certs |
| `BULLMQ_PASSPHRASE` | `test` | TLS passphrase |
| `BULLMQ_TLS_CA` | (empty) | TLS CA certificate |
| `BULLMQ_TLS_CERT` | (empty) | TLS certificate |
| `BULLMQ_TLS_KEY` | (empty) | TLS private key |

## BullMQ Job Options

| Variable | Default | Description |
|----------|---------|-------------|
| `BULLMQ_JOB_DELAY` | `0` | Job delay (ms) |
| `BULLMQ_JOB_LIFO` | `false` | Last-in-first-out |
| `BULLMQ_JOB_PRIORITY` | `1` | Job priority |
| `BULLMQ_JOB_ATTEMPTS` | `15` | Max attempts |
| `BULLMQ_JOB_STACK_TRACE_LIMIT` | `10` | Stack trace limit |
| `BULLMQ_REMOVE_ON_COMPLETED_AGE` | `604800` | Remove completed after (seconds) |
| `BULLMQ_REMOVE_ON_COMPLETED_COUNT` | `1000` | Max completed jobs to keep |
| `BULLMQ_REMOVE_ON_FAIL_AGE` | `604800` | Remove failed after (seconds) |
| `BULLMQ_REMOVE_ON_FAIL_COUNT` | `1000` | Max failed jobs to keep |

## BullMQ Backoff

| Variable | Default | Description |
|----------|---------|-------------|
| `BULLMQ_BACKOFF_TYPE` | `exponential` | Backoff type: `exponential` or `fixed` |
| `BULLMQ_BACKOFF_DELAY` | `5270` | Backoff delay (ms) |

## BullMQ Logger

| Variable | Default | Description |
|----------|---------|-------------|
| `BULLMQ_LOG_LEVEL` | `info` | Log level |
| `BULLMQ_LOG_BASE` | (empty) | JSON base object |
| `BULLMQ_LOG_TIMESTAMP_ENABLED` | `true` | Enable timestamps |
| `BULLMQ_LOG_TRANSPORT_TARGET` | `pino-pretty` | Transport target |
| `BULLMQ_LOG_TRANSPORT_TRANSLATE_TIME` | `yyyy-mm-dd HH:MM:ss.l` | Time format |
| `BULLMQ_LOG_TRANSPORT_COLORIZE` | `true` | Colorize output |
| `BULLMQ_LOG_TRANSPORT_IGNORE` | `pid,hostname` | Ignore fields |

## Ollama

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `http://ollama:11434` | Ollama server URL |
| `OLLAMA_KEEP_ALIVE` | `5m` | Model keep-alive duration |
| `OLLAMA_SYSTEM_PROMPT_DESCRIBE` | (default constant) | System prompt for describe task |
| `OLLAMA_SYSTEM_PROMPT_COMPARE` | (default constant) | System prompt for compare task |
| `OLLAMA_SYSTEM_PROMPT_OCR` | (default constant) | System prompt for OCR task |

## Example .env

```bash
# Base
PORT=3000
ADDRESS=0.0.0.0
NODE_ENV=development
PRINT_CONFIG=true
ENABLE_SWAGGER=true
BODY_LIMIT=104857600
LOG_LEVEL=log,warn,error

# Health
HEALTH_MEMORY_HEAP=256MB
HEALTH_MEMORY_RSS=256MB
HEALTH_DISK_PATH=/
HEALTH_DISK_THRESHOLD=0.8

# Cors
CORS_ORIGIN=*
CORS_METHODS=GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE
CORS_PREFLIGHT_CONTINUE=false
CORS_OPTIONS_SUCCESS_STATUS=204
CORS_CREDENTIALS=true
CORS_ALLOWED_HEADERS=Content-Type,Accept,X-Vision-LLM

# Socket.IO
SOCKET_IO_EVENT=vision
SOCKET_IO_CONNECT_TIMEOUT=45000
SOCKET_IO_MAX_HTTP_BUFFER_SIZE=262144
SOCKET_IO_CLEANUP_EMPTY_CHILD_NAMESPACES=false
SOCKET_IO_TRANSPORTS=websocket,polling,webtransport
SOCKET_IO_CORS_ORIGIN=*
SOCKET_IO_CORS_CREDENTIALS=true
SOCKET_IO_CORS_METHODS=GET,POST
SOCKET_IO_PING_INTERVAL=25000
SOCKET_IO_PING_TIMEOUT=5000
SOCKET_IO_ALLOW_EIO3=false

# BullMQ Connection
BULLMQ_HOST=keydb
BULLMQ_PORT=6379
BULLMQ_USER=default
BULLMQ_PASS=redis
BULLMQ_CONNECT_TIMEOUT=30000
BULLMQ_COMMAND_TIMEOUT=30000

# BullMQ TLS (Optional)
BULLMQ_USE_TLS=false
BULLMQ_TLS_REJECT_UNAUTHORIZED=true
BULLMQ_PASSPHRASE=test
# BULLMQ_TLS_CA=
# BULLMQ_TLS_CERT=
# BULLMQ_TLS_KEY=

# BullMQ Job Options
BULLMQ_JOB_DELAY=0
BULLMQ_JOB_LIFO=false
BULLMQ_JOB_PRIORITY=1
BULLMQ_JOB_ATTEMPTS=15
BULLMQ_JOB_STACK_TRACE_LIMIT=10
BULLMQ_REMOVE_ON_COMPLETED_AGE=604800
BULLMQ_REMOVE_ON_COMPLETED_COUNT=1000
BULLMQ_REMOVE_ON_FAIL_AGE=604800
BULLMQ_REMOVE_ON_FAIL_COUNT=1000

# BullMQ Backoff
BULLMQ_BACKOFF_TYPE=exponential
BULLMQ_BACKOFF_DELAY=5270

# BullMQ Logger
BULLMQ_LOG_LEVEL=info
# BULLMQ_LOG_BASE=
BULLMQ_LOG_TIMESTAMP_ENABLED=true
BULLMQ_LOG_TRANSPORT_TARGET=pino-pretty
BULLMQ_LOG_TRANSPORT_TRANSLATE_TIME=yyyy-mm-dd HH:MM:ss.l
BULLMQ_LOG_TRANSPORT_COLORIZE=true
BULLMQ_LOG_TRANSPORT_IGNORE=pid,hostname

# Ollama
OLLAMA_HOST=http://ollama:11434
OLLAMA_KEEP_ALIVE=5m
# OLLAMA_SYSTEM_PROMPT_DESCRIBE=
# OLLAMA_SYSTEM_PROMPT_COMPARE=
# OLLAMA_SYSTEM_PROMPT_OCR=
```