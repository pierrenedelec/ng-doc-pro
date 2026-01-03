# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@latest --activate
RUN pnpm config set store-dir .pnpm-store

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Build the application with production configuration
RUN pnpm run build:prod

# Production stage
FROM caddy:2.11-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy Caddyfile configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Create directory for SSL certificates
RUN mkdir -p /data/caddy

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost || exit 1

# Serve the application with Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
