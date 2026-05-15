FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/web ./apps/web

# Build
WORKDIR /app/apps/web
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output (much smaller than full node_modules)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
