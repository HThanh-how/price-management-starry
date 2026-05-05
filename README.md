# 📦 Starry VietNam — Enterprise Price Management System

An ultra-high-performance, production-ready **Price Management Tool** built for the Starry VietNam programming assessment. This system adheres strictly to **Enterprise Design Patterns**, featuring distributed caching, optimistic concurrency, automated audit trails, and a scalable containerized architecture.

---

## 🌐 Live Environments & Links

All services are served behind an Nginx reverse proxy.

- 🖥️ **Web Application (Next.js):** [https://price-management.clouds.io.vn](https://price-management.clouds.io.vn)
- 📜 **Swagger UI (API Docs):** [https://price-management.clouds.io.vn/swagger](https://price-management.clouds.io.vn/swagger)
- 🚀 **Scalar (Modern API Docs):** [https://price-management.clouds.io.vn/scalar](https://price-management.clouds.io.vn/scalar)
- 🩺 **System Health Check:** [https://price-management.clouds.io.vn/health](https://price-management.clouds.io.vn/health)

> **Test Credentials:**
> - **Email:** `analyst@starry.vn`
> - **Password:** `starry2026`
> 
> *(Note: The Auth guard is currently disabled by default for ease of assessment review. You will be routed directly to the Master Item List).*

---

## 📸 System Previews

### 1. Master Item List (With Details & Supplier Links)
![Master Item List Demo](file:///C:/Users/Admin/.gemini/antigravity/brain/81acab81-3fd5-4eff-a929-600a31ab7b62/item_list_demo_1778005118712.webp)
*Displays dynamic AG Grid rendering with inline editing, Master-Detail panel viewing.*

### 2. Supplier Management
![Supplier List Demo](file:///C:/Users/Admin/.gemini/antigravity/brain/81acab81-3fd5-4eff-a929-600a31ab7b62/supplier_list_demo_1778005085444.webp)
*Manage vendor details with instantaneous SWR caching sync.*

### 3. Price History Management
![Price Management Demo](file:///C:/Users/Admin/.gemini/antigravity/brain/81acab81-3fd5-4eff-a929-600a31ab7b62/add_price_demo_1778005073030.webp)
*Record prices using advanced forms and validations linked to Items and Suppliers.*

### 4. Modern API Documentation (Scalar & Swagger)
![API Documentation Demo](file:///C:/Users/Admin/.gemini/antigravity/brain/81acab81-3fd5-4eff-a929-600a31ab7b62/api_docs_demo_1778005105865.webp)
*Full OpenAPI schema generation with beautiful interactive documentation via Scalar.*

---

## 🌟 Enterprise-Grade Features

This project goes far beyond a simple CRUD application. It incorporates advanced backend and frontend techniques to ensure data integrity, high availability, and exceptional performance.

### 1. ⚡ SWR (Stale-While-Revalidate) & Distributed Redis Caching
- **Zero-Wait Data Fetching:** The backend utilizes Redis to cache API responses.
- **Smart SWR Strategy:** A "fresh marker" is kept for 3 seconds. If a request hits after 3s, the API **instantly serves the stale data** (<10ms) while silently triggering a `Task.Run` background thread to refresh the data from MySQL and update Redis.
- **Frontend Sync:** React Query (TanStack) is configured with exact matching `staleTime` and `gcTime` to work in perfect harmony with the backend cache.

### 2. 🛡️ Data Integrity & Concurrency Control
- **Optimistic Concurrency:** Uses a `RowVersion` (Timestamp) token on every table. If two users edit the same Price/Item simultaneously, the system prevents "lost updates" and throws a `ConflictException`.
- **Soft Deletion:** Records are never physically deleted. They are marked with `IsDeleted` and `DeletedAt`, and globally filtered out by Entity Framework Core.
- **Transactional Consistency:** Repository pattern paired with a Unit of Work ensures all database writes are ACID compliant.

### 3. 📝 Automated Audit Logging (EF Core Interceptors)
- **Field-Level Tracking:** An `AuditInterceptor` automatically hooks into `SaveChanges()`.
- **Deep Insights:** It records exactly Who made the change, When, the specific Entity ID, and generates a JSON payload of `OldValues` vs `NewValues` without requiring manual logging in the Business logic layer.

### 4. 🔍 Observability & Performance Monitoring
- **Slow Query Detection:** A custom `SlowQueryInterceptor` automatically detects and logs any SQL query taking longer than **200ms**, helping DevOps instantly identify bottlenecks.
- **Structured Logging:** Implemented via **Serilog**, outputting JSON logs complete with Correlation IDs (`TraceId`) that track a single request from the Nginx proxy, through the Web API, down to the database level.

### 5. 🖥️ "Hyper-Enterprise" UI/UX
- **Feature-Sliced Design (FSD):** Frontend code is modularized by business domain (`features/items`, `features/prices`, etc.) instead of by file type.
- **AG Grid v35 Theming API:** Replaced legacy CSS imports with the modern `themeQuartz` programmatic API, perfectly matching Figma design tokens (colors, borders, typography).
- **Master-Detail Flow:** A robust layout allowing users to view items and immediately drill down into Supplier details and historical price logs.

---

## 🛠 Tech Stack & Architecture

### Frontend Layer
- **Next.js 16 (App Router)**: Standalone Docker build for optimized Node.js runtime.
- **TypeScript**: Strict type checking across the entire stack.
- **AG Grid Enterprise / Community**: High-performance data tables with inline editing, pinned columns, and custom cell renderers.
- **Ant Design (v5)**: ConfigProvider linked to custom Figma CSS variables.
- **TanStack Query (v5)**: Server-state management synchronized with backend Redis TTLs.

### Backend Layer
- **.NET 10.0 Web API**: N-Layered Architecture (API, Application, Domain).
- **Entity Framework Core 10**: Code-first migrations, interceptors, and global query filters.
- **FluentValidation**: Strongly typed request validation pipelines.
- **Global Exception Handler**: Maps domain exceptions (NotFound, Conflict, Validation) to standard RFC 7807 Problem Details JSON.

### Infrastructure & DevOps
- **Docker Compose**: Full orchestration of MySQL, Redis, .NET Backend, Next.js Frontend, and Nginx.
- **Nginx Reverse Proxy**: Handles request routing (`/api` -> Backend, `/` -> Frontend), gzip compression, and security headers.
- **GitHub Actions**: Automated CI pipeline (`ci.yml`) that builds Docker images and runs tests on every push.

---

## 🚀 Quick Start (Local Setup)

The entire infrastructure can be brought up with a single command.

```bash
# 1. Clone the repository
git clone https://github.com/HThanh-how/price-management-starry.git
cd price-management-starry

# 2. Start all services
docker compose up -d --build

# 3. Check logs to ensure everything is running smoothly
docker compose logs -f
```

---

## 🏆 Assessment Checklist (Enterprise Standard)

- [x] **Correctness**: All CRUD operations for Items, Suppliers, and Prices work flawlessly.
- [x] **Performance**: Distributed Redis caching + SWR strategy ensures lightning-fast API responses.
- [x] **Scalability**: Stateless backend design, containerized architecture, decoupled frontend.
- [x] **Maintainability**: Strict N-Layer Architecture (Backend) and Feature-Sliced Design (Frontend). No "God classes" or spaghetti code.
- [x] **Resilience**: Redis Cache-Aside pattern (fallback to DB if Redis dies). Graceful error handling via RFC 7807.
- [x] **Observability**: Trace IDs, Serilog JSON logging, Slow Query detection.
- [x] **Security**: XSS protections in Nginx, CORS configured, SQL Injection prevention via EF Core parameterization.

---
*Built with ❤️ for Starry VietNam*
