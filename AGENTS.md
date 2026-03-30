<!-- This file is used by opencode to understand how to work with this project. -->

See [@ehildt/depbadge](https://raw.githubusercontent.com/ehildt/depbadge/main/llm.txt) for badge regeneration guidance.

## Code Conventions

- Imports include `.ts` extension: `import { foo } from "./bar.ts"`
- Use one-line if statements without braces: `if (!x) throw new Error()`

## Scripts

- `pnpm depcheck` - Check for unused dependencies
- `pnpm depcruise` - Analyze dependencies
- `pnpm lint:unused` - Check for unused exports (uses tsconfig.exclude.json)
- `pnpm lint` - Run ESLint
- `pnpm lint:staged` - Run lint-staged
- `pnpm test` - Run tests
- `pnpm build` - Build the project
- `pnpm start:dev` - Start in development mode with watch

## Changesets

After adding or modifying files, create a changeset markdown in `.changeset/`:

- Filename format: `<6-char-hash>-<word1>-<word2>-<word3>.md`
- Word1 + word2 + word3 should be fun, cheeky, or make sense
- If a changeset file already exists for your change, update it instead of creating a new one
- **Never modify files in `.changeset/` that were created in other commits**

## Config Files

- `.depcheckrc.yml` - Whitelist for depcheck
- `.depcruise.mjs` - Dependency cruiser config
- `tsconfig.exclude.json` - Files excluded from unused export check
- `depbadgerc.yml` - Configuration for README.md badge generation

## Architecture

- **Controllers**: Handle HTTP requests (REST at `/vision`, MCP at `/mcp`)
- **Processors**: BullMQ workers for async image processing
- **Services**: Business logic (AnalyzeImageService, JsonRpcService)
- **Base Class**: `VisionsProcessor` provides shared functionality for all processors

## Environment Variables

All configuration is done via environment variables. See `.env` file for defaults and the wiki for full documentation.