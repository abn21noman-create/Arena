# ===================================================================
# HSC Ultimate — Production Dockerfile
# ===================================================================
# Multi-stage build for minimal final image size and better security.
# Stage 1: Install dependencies and build
# Stage 2: Copy built artifacts to production runtime image
# ===================================================================

# ==================== Stage 1: Builder ====================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies (needed for some npm packages)
RUN apk add --no-cache libc6-compat

# Copy package files first (better Docker layer caching)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install exact dependencies from the single npm lockfile
RUN npm ci --no-audit --no-fund

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js app (container builders normally have sufficient memory;
# local low-memory machines use `npm run build`, the smart wrapper)
RUN npm run build:direct

# ==================== Stage 2: Runner ====================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install system deps for runtime
RUN apk add --no-cache libc6-compat curl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check (every 30s, 3 retries)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
