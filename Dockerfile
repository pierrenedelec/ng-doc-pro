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
FROM nginx:1.27-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost || exit 1

# Serve the application with nginx
CMD ["nginx", "-g", "daemon off;"]
