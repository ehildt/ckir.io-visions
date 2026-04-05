FROM node:24 AS base
ENV PNPM_HOME="/pnpm" \
  PATH="/pnpm:$PATH" \
  COREPACK_ENABLE_DOWNLOAD_PROMPT=1
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate
WORKDIR /app

# -- Dependency layer (better cache) --
FROM base AS deps
COPY package.json ./    
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install

# -- Dev (local) --
FROM base AS local
EXPOSE 5173
COPY --from=deps /app/node_modules /app/node_modules
CMD ["pnpm","dev","--host","0.0.0.0","--port","5173"]

# -- Build (bundle) --
FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm build

# -- Runtime (static) --
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
