<!-- This file is used by opencode to understand how to work with this project. -->
<!-- Read and confirm understanding of AGENTS.md and References before starting -->

## Code Conventions

- Imports include `.js` extension: `import { foo } from "./bar.js"`
- Use one-line if statements without braces: `if (!x) throw new Error()`
- all linting issues are fixed; eslint and typescript

## Scripts

- `pnpm depcheck` - Check for unused dependencies
- `pnpm depcruise` - Analyze dependencies
- `pnpm lint:unused` - Check for unused exports (uses tsconfig.exclude.json)
- `pnpm lint` - Run ESLint
- `pnpm lint:staged` - Run lint-staged
- `pnpm test` - Run tests
- `pnpm test:cov` - Run tests with coverage
- `pnpm build` - Build the project
- `pnpm start:dev` - Start in development mode with watch

## Changesets

Create a changeset using the CLI:

- `pnpm changeset add --patch --message "description"` - patch bump
- `pnpm changeset add --minor --message "description"` - minor bump
- `pnpm changeset add --major --message "description"` - major bump

- If a changeset file already exists for your change, update it instead of creating a new one
- **Never modify files in `.changeset/` that were created in other commits**
- **Version bump will always be handled by CI/CD** - do not manually bump versions

## Config Files

- `.depcheckrc.yml` - Whitelist for depcheck
- `.depcruise.mjs` - Dependency cruiser config
- `tsconfig.exclude.json` - Files excluded from unused export check
- `depbadgerc.yml` - Configuration for README.md badge generation

## Tech Stack

- **Runtime**: Node.js (ESM)
- **Framework**: NestJS
- **API**: Fastify (REST + JSON-RPC) with Swagger/OpenAPI
- **Real-time**: Socket.IO for live results
- **Queue**: BullMQ (Redis-based)
- **Database**: Redis
- **AI**: Ollama (local LLM)
- **Testing**: Vitest
- **Container**: Docker

## Architecture

- **Pattern**: NestJS modular architecture with dependency injection
- **Real-time**: Socket.IO attached to Fastify for live processing updates
- **Async Processing**: BullMQ workers for image analysis tasks

### Endpoints
- `/api/v1/vision` - REST API
- `/mcp` - JSON-RPC (MCP protocol)
- `/socket.io` - Socket.IO for real-time updates

### Components
- **Controllers**: Handle HTTP requests (REST, JSON-RPC)
- **Processors**: BullMQ workers for async image processing
- **Services**: Business logic (AnalyzeImageService, JsonRpcService)
- **Base Class**: `VisionsProcessor` provides shared functionality for all processors

## Environment Variables

All configuration is done via environment variables. See `.env` file for defaults and the wiki for full documentation.

## WIKI

- when writing .wiki never touch the source code
- read the whole project and understand it.

## References

Maintain `TODOS.md` in `.opencode/` to track discussions, goals, ideas, next steps, and progress.

- [TODOS.md](./TODOS.md) - Task tracking and progress
- [EXTEND.md](./EXTEND.md) - Detailed implementation plans

