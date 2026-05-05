# 📦 Starry VietNam — Price Management Tool

Enterprise-grade Price Management System for managing items, suppliers, and pricing data.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| UI Components | Ant Design + AG Grid |
| Backend | .NET 10 Web API (N-Layer Architecture) |
| Database | MySQL 8 |
| Cache | Redis 7 |
| Proxy | Nginx |
| Containerization | Docker Compose |

## ✨ Features

### Core Modules
- **Master Item List** — CRUD with inline editing, sorting, filtering (AG Grid)
- **Master Supplier List** — CRUD with inline editing, sorting, filtering (AG Grid)
- **Add New Price** — Assign price for Item + Supplier combination

### Enterprise Features
- **Dynamic Metadata** — Add unlimited custom fields (barcode, weight, etc.) via JSON
- **Audit Trail** — Automatic field-level change tracking (who, when, old/new values, IP)
- **Full-Page Item Edit** — Tabbed interface with Details, Metadata Editor, Audit History
- **Login Page** — Authentication with session management
- **Optimistic Concurrency** — RowVersion-based conflict detection
- **Soft Delete** — Records are never physically deleted
- **Structured Logging** — JSON logs with Serilog + correlation IDs
- **Redis Caching** — Distributed cache for frequently accessed data
- **Slow Query Detection** — EF Core interceptor logs queries > 200ms

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/HThanh-how/price-management-starry.git
cd price-management-starry

# Start all services
docker compose up -d --build

# Access the application
# Frontend: http://localhost:8080
# API Docs: http://localhost:8080/swagger
# Health:   http://localhost:8080/health
```

**Default credentials:** `analyst@starry.vn` / `starry2026`

### Option 2: Local Development

#### Prerequisites
- .NET 10 SDK
- Node.js 22+
- MySQL 8
- Redis

#### Backend
```bash
cd backend

# Create .env file
echo "DB_HOST=localhost" > .env
echo "DB_PORT=3306" >> .env
echo "DB_NAME=price_management" >> .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=your_password" >> .env
echo "REDIS_HOST=localhost" >> .env
echo "REDIS_PORT=6379" >> .env

# Run the API
dotnet run --project src/PriceManagement.Api
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Database
```bash
mysql -u root -p < scripts/init-db.sql
```

## 📁 Project Structure

```
price-management-tool/
├── backend/
│   ├── src/
│   │   ├── PriceManagement.Api/        # Controllers, Middleware, EF Core
│   │   ├── PriceManagement.Application/ # Services, DTOs, Validators
│   │   └── PriceManagement.Domain/      # Entities, Interfaces, Enums
│   └── tests/
│       └── PriceManagement.UnitTests/   # xUnit + Moq test suite
├── frontend/
│   └── src/
│       ├── app/                         # Next.js App Router pages
│       ├── components/                  # Shared UI components
│       ├── features/                    # Feature-sliced modules
│       ├── services/                    # API client layer
│       ├── types/                       # TypeScript interfaces
│       └── lib/                         # Utilities
├── scripts/
│   └── init-db.sql                      # Database schema
├── nginx/
│   └── default.conf                     # Reverse proxy config
├── docker-compose.yml                   # Full stack deployment
├── Dockerfile.backend                   # .NET 10 multi-stage build
└── Dockerfile.frontend                  # Next.js standalone build
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/items` | List all items |
| GET | `/api/v1/items/{id}` | Get item detail with supplier prices |
| POST | `/api/v1/items` | Create new item |
| PUT | `/api/v1/items/{id}` | Update item |
| DELETE | `/api/v1/items/{id}` | Soft delete item |
| GET | `/api/v1/suppliers` | List all suppliers |
| POST | `/api/v1/suppliers` | Create new supplier |
| PUT | `/api/v1/suppliers/{id}` | Update supplier |
| DELETE | `/api/v1/suppliers/{id}` | Soft delete supplier |
| GET | `/api/v1/prices` | List all prices |
| POST | `/api/v1/prices` | Create new price |
| PUT | `/api/v1/prices/{id}` | Update price |
| DELETE | `/api/v1/prices/{id}` | Soft delete price |
| GET | `/api/v1/audit-logs/{entity}/{id}` | Get audit history |

## 🧪 Testing

```bash
# Backend unit tests
cd backend
dotnet test

# Frontend tests
cd frontend
npx vitest run
```

## 📝 License

This project was developed as a programming assessment for Starry VietNam.
