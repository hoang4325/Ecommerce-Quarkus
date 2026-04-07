# E-Commerce Microservices Platform

Hệ thống thương mại điện tử theo kiến trúc microservice, xây dựng bằng **Quarkus 3.17.x + Java 17 + PostgreSQL**.

---

## Kiến trúc Phase 1

```
Client (Postman) ──► product-service (:8083)
                 ──► cart-service    (:8084)
                 ──► order-service   (:8085)
                        │
                        ├── gọi cart-service (lấy cart items)
                        └── gọi product-service (validate products)
```

**Infra**: 1 PostgreSQL container với 3 databases (`product_db`, `cart_db`, `order_db`)

---

## Yêu cầu

- Java 17
- Maven 3.9+
- Docker Desktop (for PostgreSQL)

---

## Cách chạy local

### Bước 1 — Khởi động database

```bash
docker-compose up -d
```

Kiểm tra: `docker-compose ps` → PostgreSQL phải ở trạng thái `healthy`

### Bước 2 — Compile toàn bộ project

```bash
mvn clean install -DskipTests
```

### Bước 3 — Chạy từng service (mỗi service 1 terminal)

```bash
# Terminal 1
cd product-service
mvn quarkus:dev

# Terminal 2
cd cart-service
mvn quarkus:dev

# Terminal 3
cd order-service
mvn quarkus:dev
```

### Bước 4 — Lấy JWT token để test

```bash
# Lấy token USER
cd common-lib
mvn exec:java -Dexec.mainClass="com.ecommerce.common.security.JwtTokenUtil" -Dexec.args="USER"

# Lấy token ADMIN
mvn exec:java -Dexec.mainClass="com.ecommerce.common.security.JwtTokenUtil" -Dexec.args="ADMIN"
```

Token hết hạn sau 24 giờ. Đây là **dev mock, không dùng cho production**.

---

## Swagger UI

| Service | Swagger URL |
|---|---|
| product-service | http://localhost:8083/q/swagger-ui |
| cart-service | http://localhost:8084/q/swagger-ui |
| order-service | http://localhost:8085/q/swagger-ui |

---

## End-to-end test flow

```
1. [ADMIN] POST /api/categories        → Tạo category
2. [ADMIN] POST /api/products          → Tạo product
3. [PUBLIC] GET /api/products          → Browse products
4. [USER]  POST /api/cart/items        → Add to cart
5. [USER]  GET  /api/cart              → Xem cart
6. [USER]  POST /api/orders            → Đặt hàng (order tạo từ cart)
7. [USER]  GET  /api/orders/{id}       → Xem order đã tạo
```

---

## Cấu trúc project

```
ecommerce/
├── pom.xml                    # Parent POM
├── docker-compose.yml         # PostgreSQL
├── init-databases.sql         # Tạo 3 databases
├── common-lib/                # Shared: ApiResponse, exceptions, JWT mock
├── product-service/           # CRUD products + categories (:8083)
├── cart-service/              # Shopping cart (:8084)
└── order-service/             # Order management (:8085)
```

---

## Phases

| Phase | Services | Infra | Flow |
|---|---|---|---|
| **1 (current)** | product, cart, order | PostgreSQL | Browse → Cart → Order |
| **2 (next)** | + api-gateway, auth-service | + Keycloak | Login → full flow via gateway |
| **3 (future)** | + inventory, payment, notification, user | + Kafka | Full event-driven saga |

---

## Environment

Database connections được cấu hình trong `application.properties` của từng service:

```
product-service → product_db @ localhost:5432
cart-service    → cart_db    @ localhost:5432
order-service   → order_db   @ localhost:5432
User: admin / Password: admin123
```
