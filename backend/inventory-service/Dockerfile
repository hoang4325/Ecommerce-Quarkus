# =============================================================================
# Quarkus Service Dockerfile Template (Optimized)
# Copy file này, tìm & thay: inventory-service, 8088
#
# Services & ports:
#   auth-service         8082
#   cart-service         8086
#   order-service        8087
#   inventory-service    8088
#   payment-service      8089
#   notification-service 8090
#   user-service         8091
# =============================================================================
# BUILD COMMAND (run from repo root):
#   docker build -f backend/inventory-service/Dockerfile -t inventory-service:latest .

# ─── Stage 1: Dependency cache ───────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-17-alpine AS deps
WORKDIR /workspace

COPY pom.xml .
COPY backend/common-lib/pom.xml             backend/common-lib/
COPY backend/inventory-service/pom.xml           backend/inventory-service/
COPY backend/cart-service/pom.xml           backend/cart-service/
COPY backend/order-service/pom.xml          backend/order-service/
COPY backend/auth-service/pom.xml           backend/auth-service/
COPY backend/api-gateway/pom.xml            backend/api-gateway/
COPY backend/inventory-service/pom.xml      backend/inventory-service/
COPY backend/payment-service/pom.xml        backend/payment-service/
COPY backend/notification-service/pom.xml   backend/notification-service/
COPY backend/user-service/pom.xml           backend/user-service/
COPY backend/product-service/pom.xml        backend/product-service/

RUN mvn dependency:go-offline \
    -pl backend/common-lib,backend/inventory-service -am \
    --no-transfer-progress -q

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM deps AS builder

COPY backend/common-lib/src    backend/common-lib/src
COPY backend/inventory-service/src  backend/inventory-service/src

RUN mvn package \
    -pl backend/inventory-service -am \
    -DskipTests \
    --no-transfer-progress -q && \
    rm -rf /root/.m2

# ─── Stage 3: Distroless runtime ─────────────────────────────────────────────
FROM gcr.io/distroless/java17-debian12:nonroot AS runtime

WORKDIR /app

COPY --from=builder /workspace/backend/inventory-service/target/quarkus-app/lib/     lib/
COPY --from=builder /workspace/backend/inventory-service/target/quarkus-app/*.jar    ./
COPY --from=builder /workspace/backend/inventory-service/target/quarkus-app/app/     app/
COPY --from=builder /workspace/backend/inventory-service/target/quarkus-app/quarkus/ quarkus/

EXPOSE 8088

ENTRYPOINT [ \
    "java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.awt.headless=true", \
    "-jar", "quarkus-run.jar" \
]

