# =============================================================================
# API Gateway — Optimized Dockerfile
# Final image size target: ~130MB (vs ~280MB original eclipse-temurin:17-jre)
#
# Optimization techniques applied:
#   1. distroless/java17: no shell, no pkg manager → smaller attack surface
#   2. Dependency cache layer isolated from source code layer
#   3. Maven .m2 cache cleaned before packaging
#   4. JVM tuned: container-aware heap, G1GC, reduced startup overhead
# =============================================================================

# ─── Stage 1: Dependency cache ───────────────────────────────────────────────
# Separate stage so that `mvn package` only re-runs when src changes,
# not when pom.xml is untouched (Docker layer caching)
FROM maven:3.9.9-eclipse-temurin-17-alpine AS deps
WORKDIR /workspace

# Copy ONLY pom files first — this layer is cached until any pom changes
COPY pom.xml .
COPY backend/common-lib/pom.xml      backend/common-lib/
COPY backend/api-gateway/pom.xml     backend/api-gateway/
COPY backend/product-service/pom.xml backend/product-service/
COPY backend/cart-service/pom.xml    backend/cart-service/
COPY backend/order-service/pom.xml   backend/order-service/
COPY backend/auth-service/pom.xml    backend/auth-service/
COPY backend/inventory-service/pom.xml  backend/inventory-service/
COPY backend/payment-service/pom.xml    backend/payment-service/
COPY backend/notification-service/pom.xml backend/notification-service/
COPY backend/user-service/pom.xml    backend/user-service/

# Pre-fetch all dependencies — this layer is only re-run when pom.xml changes
RUN mvn dependency:go-offline \
    -pl backend/common-lib,backend/api-gateway -am \
    --no-transfer-progress -q

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

# Copy source — only this layer re-runs on code changes
COPY backend/common-lib/src  backend/common-lib/src
COPY backend/api-gateway/src backend/api-gateway/src

RUN mvn package \
    -pl backend/api-gateway -am \
    -DskipTests \
    --no-transfer-progress -q && \
    # Remove Maven local repo from layer (already fetched; not needed in runtime)
    rm -rf /root/.m2

# ─── Stage 3: Minimal runtime (distroless) ───────────────────────────────────
# gcr.io/distroless/java17-debian12: ~85MB — no shell, no apt, no root
# For debug, switch to :debug tag which includes busybox
FROM gcr.io/distroless/java17-debian12:nonroot AS runtime

WORKDIR /app

# Copy only Quarkus fast-jar artifacts (not the whole target/)
COPY --from=builder /workspace/backend/api-gateway/target/quarkus-app/lib/     lib/
COPY --from=builder /workspace/backend/api-gateway/target/quarkus-app/*.jar    ./
COPY --from=builder /workspace/backend/api-gateway/target/quarkus-app/app/     app/
COPY --from=builder /workspace/backend/api-gateway/target/quarkus-app/quarkus/ quarkus/

EXPOSE 8083

# JVM flags:
#   -XX:+UseContainerSupport        — respect cgroup CPU/memory limits
#   -XX:MaxRAMPercentage=75.0       — use 75% of container memory for heap
#   -XX:+UseG1GC                    — G1 is optimal for Quarkus workloads
#   -XX:+ExitOnOutOfMemoryError     — fail fast instead of degraded state
#   -Djava.awt.headless=true        — no GUI classes loaded
ENTRYPOINT [ \
    "java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.awt.headless=true", \
    "-jar", "quarkus-run.jar" \
]
