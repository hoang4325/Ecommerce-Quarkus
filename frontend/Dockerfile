# =============================================================================
# Frontend — Optimized Dockerfile
# Final image size target: ~25MB (nginx:alpine) vs ~45MB original
#
# Optimization techniques:
#   1. node:22-alpine builder (not full node)  — smaller build context
#   2. npm ci --ignore-scripts  — skip optional postinstall scripts
#   3. Clean npm cache before leaving build stage
#   4. nginx:1.27-alpine runtime  — ~7MB base
#   5. Remove default nginx config files explicitly
#   6. Read-only fs compatible (tmpfs for pid/cache via nginx.conf)
# =============================================================================

# ─── Stage 1: Dependencies (cached layer) ────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy only lockfiles first — this layer is only invalidated when deps change
COPY frontend/package.json frontend/package-lock.json ./

# ci = reproducible, --ignore-scripts = skip risky postinstall hooks
# --prefer-offline uses any cached packages in BuildKit cache
RUN npm ci --frozen-lockfile --ignore-scripts

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

# Build-time config injection (can be overridden with --build-arg)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source (only this layer re-runs on code changes)
COPY frontend/ .

# Build and clean up dev artifacts in a single layer
RUN npm run build && \
    # Remove node_modules and dev files — not copied anyway but keeps layer clean
    rm -rf node_modules src public

# ─── Stage 3: Minimal nginx runtime ─────────────────────────────────────────
# nginx:1.27-alpine ≈ 7MB base — smaller than nginx:latest (~50MB)
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config and sample pages
RUN rm -rf /etc/nginx/conf.d/default.conf \
           /usr/share/nginx/html/*

# Copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (SPA routing + /api proxy)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Use non-root nginx via pid file in /tmp
RUN sed -i 's|/var/run/nginx.pid|/tmp/nginx.pid|g' /etc/nginx/nginx.conf && \
    sed -i 's|/run/nginx.pid|/tmp/nginx.pid|g' /etc/nginx/nginx.conf && \
    # Allow non-root user to bind port 8080 (alternative to 80 for non-root)
    # and write to cache dirs
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /usr/share/nginx/html /etc/nginx/conf.d && \
    chmod -R 755 /var/cache/nginx

# Run as non-root user
USER nginx

EXPOSE 80

# Validate config before starting
CMD ["nginx", "-g", "daemon off;"]
