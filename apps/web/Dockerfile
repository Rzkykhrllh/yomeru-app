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

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "start"]
