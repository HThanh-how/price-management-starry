# 📦 Starry VietNam — Price Management Tool

Enterprise-grade Price Management System built for the Starry VietNam programming assessment.

> **Live Demo:** http://20.20.20.160:8080  
> **Login:** `analyst@starry.vn` / `starry2026`  
> **Auth guard is disabled by default** — app opens directly to Items page.

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js + TypeScript | 16.x |
| UI Components | Ant Design | 5.x |
| Data Tables | AG Grid | 33.x |
| State Management | TanStack Query | 5.x |
| Styling | Tailwind CSS | 4.x |
| Backend | .NET Web API | 10.0 |
| Database | MySQL | 8.0 |
| Cache | Redis | 7.x |
| Reverse Proxy | Nginx | Alpine |
| Containerization | Docker Compose | v2 |
| CI/CD | GitHub Actions | — |

---

## ✨ Features

### Core Modules (Required)

#### 1. Master Item List
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ AG Grid with **inline editing**, sorting, filtering
- ✅ Full-page item detail view with tabbed interface
- ✅ **Item → Suppliers panel**: click any item to see all linked suppliers and their prices
- ✅ Dynamic metadata editor (JSON field for custom attributes like barcode, weight, etc.)
- ✅ Fields: Item Code, Item Name, Description, Unit, Category, Base Price, Status, Metadata

#### 2. Master Supplier List
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ AG Grid with **inline editing**, sorting, filtering
- ✅ Fields: Supplier Code, Supplier Name, Contact Person, Email, Phone, Address, Status

#### 3. Add New Price
- ✅ Select existing Item + Supplier from dropdowns
- ✅ Create price record with Price, Currency (VND/USD/EUR/JPY), Effective Date, Remark
- ✅ AG Grid with **inline editing**, sorting, filtering
- ✅ Data saved via API to MySQL database

### Enterprise Extras (Bonus)

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Login page with BCrypt password hashing (DB-backed) |
| 📝 Audit Trail | Automatic field-level change tracking (who, when, old/new values, IP) |
| 🏷️ Dynamic Metadata | Unlimited custom fields per item via JSON editor |
| ⚡ Redis Caching | Distributed cache for frequently accessed data |
| 🔍 Slow Query Detection | EF Core interceptor logs queries > 200ms |
| 🔒 Optimistic Concurrency | RowVersion-based conflict detection |
| 🗑️ Soft Delete | Records are never physically removed |
| 📊 Structured Logging | JSON logs with Serilog + correlation IDs |
| 🐳 Docker Deployment | Full-stack containerization with Docker Compose |
| 🔄 CI/CD | GitHub Actions pipeline (build, test, Docker validation) |

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/HThanh-how/price-management-starry.git
cd price-management-starry

# Start all services (MySQL, Redis, Backend, Frontend, Nginx)
docker compose up -d --build

# Wait ~60s for MySQL initialization, then access:
# Frontend:  http://localhost:8080
# API Docs:  http://localhost:8080/swagger
# Health:    http://localhost:8080/health
```

### Option 2: Local Development

#### Prerequisites
- .NET 10 SDK
- Node.js 22+
- MySQL 8 (running on localhost:3306)
- Redis (running on localhost:6379)

#### Database Setup
```bash
mysql -u root -p < scripts/init-db.sql
```

#### Backend
```bash
cd backend

# Create environment file
cp .env.example .env
# Edit .env with your DB credentials

# Run the API (port 5000)
dotnet run --project src/PriceManagement.Api
```

#### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
# Opens on http://localhost:3000
```

---

## 📁 Project Structure

```
price-management-tool/
├── .github/workflows/
│   └── ci.yml                           # GitHub Actions CI/CD pipeline
├── backend/
│   ├── src/
│   │   ├── PriceManagement.Api/         # Controllers, Middleware, EF Core, DI
│   │   ├── PriceManagement.Application/ # Services, DTOs, Validators (FluentValidation)
│   │   └── PriceManagement.Domain/      # Entities, Interfaces, Enums
│   └── tests/
│       └── PriceManagement.UnitTests/   # xUnit + Moq test suite
├── frontend/
│   └── src/
│       ├── app/                         # Next.js App Router (pages + layouts)
│       │   ├── (main)/                  # Protected route group
│       │   │   ├── items/               # Master Item List + [id] detail
│       │   │   ├── suppliers/           # Master Supplier List
│       │   │   └── prices/              # Add New Price
│       │   └── login/                   # Authentication page
│       ├── components/                  # Shared UI (AppLayout, Providers)
│       ├── features/                    # Feature-sliced modules
│       │   ├── items/                   # Item grid, detail, metadata editor
│       │   ├── suppliers/               # Supplier grid, create modal
│       │   └── prices/                  # Price grid, form, hooks
│       ├── services/                    # API client (Axios)
│       ├── types/                       # TypeScript interfaces + Zod schemas
│       └── lib/                         # TanStack Query client, utilities
├── scripts/
│   └── init-db.sql                      # Database schema + sample data
├── nginx/
│   └── default.conf                     # Reverse proxy configuration
├── docker-compose.yml                   # Full-stack deployment
├── Dockerfile.backend                   # .NET 10 multi-stage build
├── Dockerfile.frontend                  # Next.js standalone build
└── README.md                            # This file
```

---

## 🔌 API Endpoints

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/items` | List all items (with supplier prices) |
| GET | `/api/v1/items/{id}` | Get item detail with linked suppliers |
| POST | `/api/v1/items` | Create new item |
| PUT | `/api/v1/items/{id}` | Update item |
| DELETE | `/api/v1/items/{id}` | Soft delete item |

### Suppliers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/suppliers` | List all suppliers |
| POST | `/api/v1/suppliers` | Create new supplier |
| PUT | `/api/v1/suppliers/{id}` | Update supplier |
| DELETE | `/api/v1/suppliers/{id}` | Soft delete supplier |

### Prices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/prices` | List all price records |
| POST | `/api/v1/prices` | Create new price |
| PUT | `/api/v1/prices/{id}` | Update price |
| DELETE | `/api/v1/prices/{id}` | Soft delete price |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with email + password |
| POST | `/api/v1/auth/register` | Register new user |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit-logs/{entity}/{id}` | Get audit history for entity |

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
dotnet test

# Frontend tests
cd frontend
npx vitest run
```

---

## 🔐 Authentication

| Field | Value |
|-------|-------|
| **Email** | `analyst@starry.vn` |
| **Password** | `starry2026` |

> Auth guard is **commented out** by default for easy demo access.  
> To re-enable: uncomment the auth guard in `frontend/src/app/(main)/layout.tsx`.

---

## 📊 Sample Data

The system comes pre-loaded with comprehensive test data:

| Entity | Count | Examples |
|--------|-------|---------|
| Items | 10 | Gạo ST25, Thép HRC, Laptop Dell, Cà phê Robusta... |
| Suppliers | 6 | Phú Thịnh Trading, Starlight Tech, Vinaglobal XNK... |
| Price Records | 18 | Multiple suppliers per item, VND + USD currencies |

---

## 📝 License

This project was developed as a programming assessment for **Starry VietNam**.
