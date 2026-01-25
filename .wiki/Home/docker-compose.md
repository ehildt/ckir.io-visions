## Docker Compose

Simply copy and paste the example into your compose.yml.
You’ll need to update the Ollama volume paths, and the file will work as-is.
Currently, I’m mapping Ollama to the models on my Windows system using WSL.

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
      - qdrant
      - keydb
    env_file:
      - ./.env
    environment:
      - NODE_ENV=local
      - PRINT_CONFIG=false
      - ENABLE_SWAGGER=true
    ports:
      - 3005:3005
      - 4005:4005
    networks:
      - ckir-network

  qdrant:
    image: qdrant/qdrant
    container_name: qdrant
    environment:
      QDRANT__CLUSTER__ENABLED: "true"
      QDRANT__CLUSTER__P2P__PORT: "6335"
      QDRANT__CLUSTER__P2P__FORCE_NODE_NAME: "node-1"
      QDRANT__CLUSTER__P2P__CONTACTS: "qdrant:6335"
      QDRANT_API_KEY: e4f2c7d19a4b3f1285e7c93d6ac8f01a
    volumes:
      - qdrant_data:/qdrant/storage
    ports:
      - 6333:6333
    restart: unless-stopped
    command: ["./qdrant", "--uri", "http://qdrant:6335"]
    networks:
      - ckir-network

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - /mnt/c/Users/ehi/.ollama:/root/.ollama
    gpus: all
    restart: unless-stopped
    networks:
      - ckir-network

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
      - ckir-network

volumes:
  ollama:
  keydb_data:
  qdrant_data:

networks:
  ckir-network:
    name: ckir-network
    driver: bridge
```