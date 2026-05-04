# ============================================================
# Price Management Tool - Makefile
# Shortcuts for common development, build, and deployment tasks
# ============================================================

# Project paths
API_PROJECT     = src/PriceManagement.Api
SOLUTION        = PriceManagement.sln
DEPLOY_DIR      = deploy
SQL_OUTPUT      = $(DEPLOY_DIR)/init.sql

# Remote server configuration
REMOTE_HOST     = 20.20.20.160
REMOTE_USER     = root
REMOTE_PATH     = /opt/price-management/deploy

# Default target: show all available commands
.PHONY: help
help: ## Show this help message
	@echo.
	@echo  ===== Price Management Tool - Available Commands =====
	@echo.
	@echo  Development:
	@echo    make run        - Run the API in development mode
	@echo    make build      - Build the entire solution
	@echo    make clean      - Clean build artifacts
	@echo    make restore    - Restore NuGet packages
	@echo.
	@echo  Database:
	@echo    make migrate    - Apply pending EF Core migrations
	@echo    make migration  - Create a new migration (NAME=MigrationName)
	@echo    make sql        - Generate SQL script from migrations
	@echo    make db-reset   - Drop and recreate database via migration
	@echo.
	@echo  Testing:
	@echo    make health     - Check API health endpoint
	@echo    make swag       - Open Swagger UI in browser
	@echo    make test-api   - Quick smoke test (create item + supplier)
	@echo.
	@echo  Infrastructure:
	@echo    make infra-up   - Start MySQL + Redis via Docker Compose
	@echo    make infra-down - Stop MySQL + Redis containers
	@echo    make infra-logs - View container logs
	@echo    make infra-ps   - Show container status
	@echo.
	@echo  Deployment:
	@echo    make deploy     - Deploy docker-compose to remote server
	@echo.
	@echo  =====================================================
	@echo.

# ============================================================
# Development Commands
# ============================================================

.PHONY: run
run: ## Run the API in development mode
	dotnet run --project $(API_PROJECT)

.PHONY: build
build: ## Build the entire solution
	dotnet build $(SOLUTION)

.PHONY: clean
clean: ## Clean all build artifacts
	dotnet clean $(SOLUTION)

.PHONY: restore
restore: ## Restore NuGet packages
	dotnet restore $(SOLUTION)

# ============================================================
# Database Commands
# ============================================================

.PHONY: migrate
migrate: ## Apply pending EF Core migrations to the database
	dotnet ef database update --project $(API_PROJECT)

.PHONY: migration
migration: ## Create a new migration. Usage: make migration NAME=AddNewField
	@if "$(NAME)"=="" ( echo ERROR: Please specify NAME. Usage: make migration NAME=AddNewField ) else ( dotnet ef migrations add $(NAME) --project $(API_PROJECT) )

.PHONY: sql
sql: ## Generate SQL script from all migrations
	dotnet ef migrations script -o ../$(SQL_OUTPUT) --project $(API_PROJECT) --idempotent
	@echo SQL script generated at: $(SQL_OUTPUT)

.PHONY: db-reset
db-reset: ## Drop and recreate database (WARNING: destroys all data)
	@echo **WARNING: This will DROP the entire database and recreate it!**
	dotnet ef database drop --project $(API_PROJECT) --force
	dotnet ef database update --project $(API_PROJECT)
	@echo Database reset completed.

# ============================================================
# Testing / Validation Commands
# ============================================================

.PHONY: health
health: ## Check API health endpoint
	curl -s http://localhost:5000/health
	@echo.

.PHONY: swag
swag: ## Open Swagger UI in default browser
	start http://localhost:5000/swagger

.PHONY: test-api
test-api: ## Quick smoke test: create an item, a supplier, then a price record
	@echo === Creating test Item ===
	curl -s -X POST http://localhost:5000/api/v1/items -H "Content-Type: application/json" -d "{\"itemCode\":\"TEST-001\",\"itemName\":\"Test Item\",\"description\":\"Smoke test item\",\"unit\":\"PCS\"}"
	@echo.
	@echo === Creating test Supplier ===
	curl -s -X POST http://localhost:5000/api/v1/suppliers -H "Content-Type: application/json" -d "{\"supplierCode\":\"SUP-001\",\"supplierName\":\"Test Supplier\",\"contactPerson\":\"John Doe\",\"email\":\"john@test.com\",\"phone\":\"0901234567\",\"address\":\"123 Test St\"}"
	@echo.
	@echo === Listing Items ===
	curl -s http://localhost:5000/api/v1/items
	@echo.
	@echo === Listing Suppliers ===
	curl -s http://localhost:5000/api/v1/suppliers
	@echo.
	@echo === Smoke test completed ===

# ============================================================
# Infrastructure Commands (Docker)
# ============================================================

.PHONY: infra-up
infra-up: ## Start MySQL + Redis via Docker Compose
	docker compose -f $(DEPLOY_DIR)/docker-compose.yml up -d
	@echo Infrastructure started. MySQL: 3306, Redis: 6379

.PHONY: infra-down
infra-down: ## Stop MySQL + Redis containers
	docker compose -f $(DEPLOY_DIR)/docker-compose.yml down
	@echo Infrastructure stopped.

.PHONY: infra-logs
infra-logs: ## View real-time container logs
	docker compose -f $(DEPLOY_DIR)/docker-compose.yml logs -f

.PHONY: infra-ps
infra-ps: ## Show container status
	docker compose -f $(DEPLOY_DIR)/docker-compose.yml ps

# ============================================================
# Remote Deployment Commands
# ============================================================

.PHONY: deploy
deploy: ## Deploy docker-compose to remote server and start services
	scp $(DEPLOY_DIR)/docker-compose.yml $(REMOTE_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/docker-compose.yml
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "cd $(REMOTE_PATH) ; docker compose up -d"
	@echo Deployment to $(REMOTE_HOST) completed.
