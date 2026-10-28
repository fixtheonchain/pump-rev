# syntax=docker/dockerfile:1
FROM node:22-bookworm AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 4349
HEALTHCHECK CMD ["node", "tools/probe.cjs", "coins"]
CMD ["node", "services/coins/dist/main.js"]
