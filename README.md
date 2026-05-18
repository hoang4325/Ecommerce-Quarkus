# 🛍️ Ecommerce Quarkus — Hệ thống Thương mại Điện tử Microservices

Hệ thống thương mại điện tử phong cách thời trang được xây dựng theo kiến trúc **microservices** với backend **Quarkus (Java)**, frontend **React + TypeScript**, xác thực bằng **Keycloak**, giao tiếp bất đồng bộ qua **Apache Kafka** và có thể triển khai bằng **Docker Compose** hoặc **Kubernetes**.

---

## 📋 Mục lục

- [Tổng quan hệ thống](#tổng-quan-hệ-thống)
- [Kiến trúc](#kiến-trúc)
- [Các service](#các-service)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy](#cài-đặt-và-chạy)
- [Các endpoint chính](#các-endpoint-chính)
- [Tài khoản mặc định](#tài-khoản-mặc-định)

---

## 🏗️ Tổng quan hệ thống

**Shop.CO** là nền tảng mua sắm thời trang trực tuyến, cung cấp đầy đủ luồng nghiệp vụ từ duyệt sản phẩm, quản lý giỏ hàng, đặt hàng đến thanh toán và thông báo. Hệ thống được thiết kế theo hướng **Cloud-Native**, có thể mở rộng độc lập từng service.

### Tính năng chính

- 🔐 **Xác thực & Phân quyền**: Đăng ký, đăng nhập, JWT, OAuth2 qua Keycloak
- 🛒 **Mua sắm**: Duyệt danh mục, tìm kiếm, lọc theo màu/size/phong cách/giá
- 🛍️ **Giỏ hàng**: Thêm/xóa/cập nhật sản phẩm trong giỏ theo thời gian thực
- 📦 **Đặt hàng**: Tạo đơn hàng, theo dõi trạng thái đơn hàng
- 💳 **Thanh toán**: Xử lý thanh toán bất đồng bộ qua Kafka
- 📊 **Kho hàng**: Quản lý tồn kho, kiểm tra số lượng còn lại
- 🔔 **Thông báo**: Thông báo real-time cho người dùng
- ⭐ **Đánh giá**: Viết và xem đánh giá sản phẩm
- 👤 **Quản trị**: Dashboard admin quản lý sản phẩm, danh mục, đơn hàng

---

## 🏛️ Kiến trúc

```
                          ┌─────────────────┐
                          │    Frontend     │
                          │  React + Vite   │
                          │   Port: 3000    │
                          └────────┬────────┘
                                   │ HTTP
                          ┌────────▼────────┐
                          │   API Gateway   │
                          │    Quarkus      │
                          │   Port: 8086    │
                          └──┬──┬──┬──┬──┬──┘
                 ┌───────────┘  │  │  │  └──────────────┐
         ┌───────▼──────┐       │  │  │       ┌─────────▼──────┐
         │ Auth Service │       │  │  │       │ User Service   │
         │  Port: 8082  │       │  │  │       │  Port: 8090    │
         └──────────────┘       │  │  │       └────────────────┘
                        ┌───────▼──┐  └──────────┐
               ┌────────▼────────┐ │  ┌──────────▼──────┐
               │ Product Service │ │  │  Cart Service   │
               │   Port: 8083    │ │  │   Port: 8084    │
               └─────────────────┘ │  └─────────────────┘
                          ┌─────────▼──────────┐
                          │   Order Service    │
                          │    Port: 8085      │
                          └────────┬───────────┘
              ┌────────────────────┤
    ┌─────────▼──────┐   ┌────────▼──────┐   ┌──────────────────┐
    │ Payment Service│   │  Inventory    │   │ Notification Svc │
    │   Port: 8088   │   │   Service     │   │   Port: 8089     │
    └────────────────┘   │  Port: 8087   │   └──────────────────┘
                         └───────────────┘
                               ▲ ▲ ▲
                    ┌──────────┘ │ └─────────────┐
             ┌──────▼──────┐     │     ┌──────────▼──────┐
             │    Kafka    │     │     │   PostgreSQL     │
             │  Port:29092 │     │     │   Port: 5432     │
             └─────────────┘     │     └─────────────────┘
                         ┌───────▼──────┐
                         │   Keycloak   │
                         │  Port: 8080  │
                         └──────────────┘
```

---

## 🔧 Các Service

| Service | Port | Mô tả | Database |
|---|---|---|---|
| **api-gateway** | 8086 | Cổng vào duy nhất, routing, xác thực JWT | — |
| **auth-service** | 8082 | Đăng ký, đăng nhập, quản lý Keycloak | `auth_db` |
| **product-service** | 8083 | CRUD sản phẩm, danh mục, tìm kiếm, đánh giá | `product_db` |
| **cart-service** | 8084 | Quản lý giỏ hàng người dùng | `cart_db` |
| **order-service** | 8085 | Tạo và theo dõi đơn hàng | `order_db` |
| **inventory-service** | 8087 | Quản lý tồn kho, trừ số lượng khi đặt hàng | `inventory_db` |
| **payment-service** | 8088 | Xử lý thanh toán (async qua Kafka) | `payment_db` |
| **notification-service** | 8089 | Gửi thông báo nội bộ cho người dùng | `user_db` |
| **user-service** | 8090 | Quản lý hồ sơ người dùng | `user_db` |
| **frontend** | 3000 | Giao diện người dùng React | — |
| **keycloak** | 8080 | Identity Provider — xác thực & phân quyền | `keycloak_db` |
| **kafka** | 29092 | Message broker — giao tiếp async giữa services | — |
| **postgres** | 5432 | Cơ sở dữ liệu quan hệ | tất cả services |

### Luồng nghiệp vụ đặt hàng

```
User → Cart Service → Order Service
                          │
                    [Kafka: order-created]
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
  Inventory Service  Payment Service  Notification Service
  (Trừ tồn kho)    (Xử lý thanh toán) (Gửi thông báo)
```

---

## 💻 Công nghệ sử dụng

### Backend
- **Quarkus 3.x** — Java framework siêu nhẹ, tối ưu cho Cloud-Native
- **Hibernate ORM + Panache** — ORM với Active Record pattern
- **SmallRye JWT** — Xác thực JWT
- **Quarkus OIDC** — Tích hợp OAuth2/OIDC với Keycloak
- **SmallRye Reactive Messaging** — Giao tiếp bất đồng bộ qua Kafka
- **RESTEasy Reactive** — REST API không chặn (non-blocking)
- **Flyway** — Database migration

### Frontend
- **React 18 + TypeScript** — UI framework
- **Vite** — Build tool cực nhanh
- **Tailwind CSS** — Utility-first CSS
- **Framer Motion** — Thư viện animation
- **TanStack Query (React Query)** — Quản lý trạng thái server-side, caching
- **React Router v6** — Điều hướng SPA
- **Axios** — HTTP client
- **Lucide React** — Icon library

### Infrastructure
- **Keycloak 24** — Identity & Access Management
- **Apache Kafka 3.7** — Message streaming (KRaft mode, không cần Zookeeper)
- **PostgreSQL 16** — Cơ sở dữ liệu
- **Nginx** — Web server cho frontend
- **Docker Compose** — Orchestration phát triển cục bộ
- **Kubernetes** — Orchestration production (manifest có sẵn trong `k8s/`)

---

## 📁 Cấu trúc thư mục

```
ecommerce/
├── backend/
│   ├── api-gateway/          # Cổng vào, routing & auth middleware
│   ├── auth-service/         # Xác thực, quản lý người dùng Keycloak
│   ├── cart-service/         # Giỏ hàng
│   ├── common-lib/           # Thư viện dùng chung (DTOs, utilities)
│   ├── inventory-service/    # Quản lý tồn kho
│   ├── notification-service/ # Hệ thống thông báo
│   ├── order-service/        # Đặt hàng
│   ├── payment-service/      # Thanh toán
│   ├── product-service/      # Sản phẩm & danh mục
│   └── user-service/         # Hồ sơ người dùng
├── frontend/
│   └── src/
│       ├── api/              # API client & endpoints
│       ├── auth/             # Auth store, auth service
│       ├── components/       # UI components (Header, Footer, Layout...)
│       ├── pages/            # Các trang (Home, Products, Cart, Orders...)
│       └── types/            # TypeScript types & interfaces
├── k8s/                      # Kubernetes manifests
├── keycloak/                 # Keycloak realm config
├── docker-compose.yml        # Docker Compose cho local dev
├── deploy-local.ps1          # Script deploy lên local Kubernetes
└── pom.xml                   # Maven parent POM
```

---

## ⚙️ Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Docker | 24+ |
| Docker Compose | 2.20+ |
| Node.js | 20+ (nếu chạy frontend riêng) |
| Java | 17+ (nếu build backend riêng) |
| Maven | 3.9+ (nếu build backend riêng) |

---

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/hoang4325/Ecommerce-Quarkus.git
cd Ecommerce-Quarkus
```

### 2. Chạy toàn bộ hệ thống với Docker Compose

```bash
docker-compose up -d --build
```

> ⏳ Lần đầu build sẽ mất 10-20 phút (tải dependencies Maven). Các lần sau nhanh hơn nhờ cache.

### 3. Kiểm tra trạng thái

```bash
docker-compose ps
```

### 4. Truy cập ứng dụng

| Ứng dụng | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| 🔑 Keycloak Admin | http://localhost:8080 |
| 🔌 API Gateway | http://localhost:8086 |

### 5. Dừng hệ thống

```bash
docker-compose down
```

### Triển khai lên Kubernetes (local)

```powershell
# Chạy script tự động (Windows PowerShell)
.\deploy-local.ps1
```

Script sẽ tự động: build image, push lên local registry, apply manifests và kiểm tra trạng thái pods.

---

## 📡 Các Endpoint chính

Tất cả request đi qua **API Gateway** tại `http://localhost:8086`.

### Xác thực
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | Đăng nhập, nhận JWT |
| POST | `/api/auth/refresh` | Làm mới access token |
| POST | `/api/auth/logout` | Đăng xuất |

### Sản phẩm
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/products` | Danh sách sản phẩm (có phân trang, lọc) |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/products/{id}/reviews` | Đánh giá sản phẩm |
| POST | `/api/products/{id}/reviews` | Viết đánh giá (yêu cầu đăng nhập) |

### Giỏ hàng *(yêu cầu đăng nhập)*
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/cart` | Lấy giỏ hàng hiện tại |
| POST | `/api/cart/items` | Thêm sản phẩm vào giỏ |
| PUT | `/api/cart/items/{id}` | Cập nhật số lượng |
| DELETE | `/api/cart/items/{id}` | Xóa sản phẩm khỏi giỏ |

### Đơn hàng *(yêu cầu đăng nhập)*
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/orders` | Danh sách đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng mới |
| GET | `/api/orders/{id}` | Chi tiết đơn hàng |

---

## 🔑 Tài khoản mặc định

### Keycloak Admin Console (http://localhost:8080)
| Field | Giá trị |
|---|---|
| Username | `admin` |
| Password | `admin123` |

### Tài khoản người dùng mẫu (đăng ký qua giao diện hoặc API)
Tự đăng ký tài khoản tại http://localhost:3000/register

### Tài khoản Admin hệ thống
Sau khi đăng ký, có thể cấp quyền `admin` trong Keycloak Admin Console.

---

## 📝 Ghi chú phát triển

- **Hot reload**: Không có hot reload trong Docker. Sau khi thay đổi code frontend, cần chạy lại:
  ```bash
  docker-compose up -d --build frontend
  ```
- **Xem logs**:
  ```bash
  docker-compose logs -f [tên-service]
  # Ví dụ:
  docker-compose logs -f api-gateway
  ```
- **Kafka topics**: Hệ thống tự tạo topics khi khởi động
- **Database**: Mỗi service có database riêng, schema được tạo tự động qua Hibernate DDL/Flyway

---

## 📜 License

MIT License — feel free to use, modify and distribute.
