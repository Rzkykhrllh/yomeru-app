FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build
RUN npm run build

FROM base AS runner
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["./entrypoint.sh"]
