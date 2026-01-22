FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm exec prisma generate

# Build
RUN pnpm run build

FROM base AS runner
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["pnpm", "start"]
