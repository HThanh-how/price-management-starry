# Price Management Tool

Enterprise-grade tool for managing items, suppliers, and pricing data.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16 + TypeScript + Ant Design + AG Grid |
| **Backend** | .NET 10 Web API (Clean Architecture) |
| **Database** | MySQL 8 |
| **Logging** | Serilog (structured JSON) |
| **Validation** | FluentValidation |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker + Docker Compose |

## Architecture

```
├── backend/                           # .NET 10 Web API
│   ├── src/
│   │   ├── PriceManagement.Domain/    # Entities, Interfaces, Exceptions
│   │   ├── PriceManagement.Application/ # Services, DTOs, Validators
│   │   └── PriceManagement.Api/       # Controllers, Middleware, Data Access
│   └── Dockerfile
├── frontend/                          # Next.js + TypeScript
│   └── src/
│       ├── app/                       # App Router pages
│       ├── components/                # Reusable UI components
│       ├── services/                  # API service layer
│       ├── types/                     # TypeScript type definitions
│       └── lib/                       # Axios client configuration
├── docker-compose.yml                 # Full stack orchestration
└── .github/workflows/ci.yml          # CI/CD pipeline
```

## Features

### Master Item List
- CRUD operations for items (Code, Name, Description, Unit, Status)
- AG Grid with inline editing, sorting, filtering
- Detail panel showing linked suppliers and prices

### Master Supplier List
- CRUD operations for suppliers (Code, Name, Contact, Email, Phone, Address, Status)
- AG Grid with inline editing, sorting, filtering

### Price Management
- Assign prices for Item + Supplier combinations
- Select existing items and suppliers from dropdowns
- AG Grid with inline editing for price, currency, remarks

### Enterprise Features
- ✅ Clean Architecture (3-layer separation)
- ✅ UUID primary keys (Guid)
- ✅ Audit trail (CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
- ✅ Soft delete (IsDeleted flag with global query filters)
- ✅ Optimistic concurrency (RowVersion)
- ✅ Correlation/Trace ID (X-Correlation-Id header)
- ✅ Structured JSON logging (Serilog)
- ✅ FluentValidation pipeline
- ✅ Global exception handling with standardized API envelope
- ✅ Health checks (/health endpoint)
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration
- ✅ Docker + Docker Compose
- ✅ GitHub Actions CI/CD
- ✅ EF Core Code-First migrations

### API Response Format
All endpoints return a standardized envelope:
```json
{
  "success": true,
  "code": 200,
  "message": "Request completed successfully.",
  "data": { ... },
  "errors": null,
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

## Setup Instructions

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 22+](https://nodejs.org/)
- [MySQL 8](https://dev.mysql.com/downloads/)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd price-management-tool

# Start all services (API + MySQL)
docker-compose up -d

# Access the application
# API: http://localhost:5000/swagger
# Frontend: Run separately (see below)
```

### Option 2: Manual Setup

#### Database
1. Install MySQL 8 and create a database:
```sql
CREATE DATABASE price_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Backend
```bash
cd backend/src/PriceManagement.Api

# Configure database connection in .env
# Edit .env file with your MySQL credentials
cp .env.example .env

# Run the API (auto-applies migrations on startup)
dotnet run
```
The API will be available at `http://localhost:5000`.
Swagger documentation: `http://localhost:5000/swagger`.

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
# Edit .env.local if needed (default: http://localhost:5000/api/v1)

# Start development server
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### Database Script
EF Core migrations are applied automatically when the API starts.
To generate a SQL script manually:
```bash
cd backend
dotnet ef migrations script --project src/PriceManagement.Api --output scripts/init-db.sql
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/items` | List items (paginated) |
| GET | `/api/v1/items/{id}` | Get item by ID |
| GET | `/api/v1/items/{id}/detail` | Get item with supplier prices |
| POST | `/api/v1/items` | Create item |
| PUT | `/api/v1/items/{id}` | Update item |
| DELETE | `/api/v1/items/{id}` | Soft-delete item |
| GET | `/api/v1/suppliers` | List suppliers (paginated) |
| GET | `/api/v1/suppliers/{id}` | Get supplier by ID |
| POST | `/api/v1/suppliers` | Create supplier |
| PUT | `/api/v1/suppliers/{id}` | Update supplier |
| DELETE | `/api/v1/suppliers/{id}` | Soft-delete supplier |
| GET | `/api/v1/prices` | List prices (paginated) |
| GET | `/api/v1/prices/{id}` | Get price by ID |
| GET | `/api/v1/prices/by-item/{itemId}` | Get prices for an item |
| POST | `/api/v1/prices` | Create price record |
| PUT | `/api/v1/prices/{id}` | Update price record |
| DELETE | `/api/v1/prices/{id}` | Soft-delete price record |
| GET | `/health` | Health check endpoint |

## Screenshots

> Screenshots will be added after running the application.

## License

This project is created for evaluation purposes.
