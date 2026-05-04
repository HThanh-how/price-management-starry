<#
.SYNOPSIS
    Price Management Tool - Development Task Runner
    Equivalent to Makefile for Windows PowerShell environment.

.DESCRIPTION
    Usage: .\make.ps1 <command>
    Run without arguments to see all available commands.

.EXAMPLE
    .\make.ps1 run       # Start the API server
    .\make.ps1 swag      # Open Swagger UI in browser
    .\make.ps1 build     # Build the solution
    .\make.ps1 health    # Check API health
    .\make.ps1 test-api  # Run smoke tests
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Name = ""
)

# Project configuration
$API_PROJECT   = "src/PriceManagement.Api"
$SOLUTION      = "PriceManagement.sln"
$DEPLOY_DIR    = "deploy"
$SQL_OUTPUT    = "$DEPLOY_DIR/init.sql"
$API_URL       = "http://localhost:5000"
$REMOTE_HOST   = "20.20.20.160"
$REMOTE_USER   = "root"
$REMOTE_PATH   = "/opt/price-management/deploy"

function Show-Help {
    Write-Host ""
    Write-Host "  ===== Price Management Tool - Available Commands =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Development:" -ForegroundColor Yellow
    Write-Host "    run          - Run the API in development mode"
    Write-Host "    build        - Build the entire solution"
    Write-Host "    clean        - Clean build artifacts"
    Write-Host "    restore      - Restore NuGet packages"
    Write-Host ""
    Write-Host "  Database:" -ForegroundColor Yellow
    Write-Host "    migrate      - Apply pending EF Core migrations"
    Write-Host "    migration    - Create a new migration (use -Name <MigrationName>)"
    Write-Host "    sql          - Generate SQL script from migrations"
    Write-Host "    db-reset     - Drop and recreate database via migration"
    Write-Host ""
    Write-Host "  Testing:" -ForegroundColor Yellow
    Write-Host "    health       - Check API health endpoint"
    Write-Host "    swag         - Open Swagger UI in browser"
    Write-Host "    test-api     - Quick smoke test (create item + supplier)"
    Write-Host ""
    Write-Host "  Infrastructure:" -ForegroundColor Yellow
    Write-Host "    infra-up     - Start MySQL + Redis via Docker Compose"
    Write-Host "    infra-down   - Stop MySQL + Redis containers"
    Write-Host "    infra-logs   - View container logs"
    Write-Host "    infra-ps     - Show container status"
    Write-Host ""
    Write-Host "  Deployment:" -ForegroundColor Yellow
    Write-Host "    deploy       - Deploy docker-compose to remote server"
    Write-Host ""
    Write-Host "  =====================================================" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================================
# Development Commands
# ============================================================

function Invoke-Run {
    Write-Host "[RUN] Starting API server..." -ForegroundColor Green
    dotnet run --project $API_PROJECT
}

function Invoke-Build {
    Write-Host "[BUILD] Building solution..." -ForegroundColor Green
    dotnet build $SOLUTION
}

function Invoke-Clean {
    Write-Host "[CLEAN] Cleaning build artifacts..." -ForegroundColor Green
    dotnet clean $SOLUTION
}

function Invoke-Restore {
    Write-Host "[RESTORE] Restoring NuGet packages..." -ForegroundColor Green
    dotnet restore $SOLUTION
}

# ============================================================
# Database Commands
# ============================================================

function Invoke-Migrate {
    Write-Host "[MIGRATE] Applying pending migrations..." -ForegroundColor Green
    dotnet ef database update --project $API_PROJECT
}

function Invoke-Migration {
    if ([string]::IsNullOrEmpty($Name)) {
        Write-Host "[ERROR] Please specify migration name: .\make.ps1 migration -Name AddNewField" -ForegroundColor Red
        return
    }
    Write-Host "[MIGRATION] Creating migration: $Name" -ForegroundColor Green
    dotnet ef migrations add $Name --project $API_PROJECT
}

function Invoke-Sql {
    Write-Host "[SQL] Generating SQL script..." -ForegroundColor Green
    dotnet ef migrations script -o ../$SQL_OUTPUT --project $API_PROJECT --idempotent
    Write-Host "[SQL] Script generated at: $SQL_OUTPUT" -ForegroundColor Cyan
}

function Invoke-DbReset {
    Write-Host ""
    Write-Host "  **WARNING: This will DROP the entire database and recreate it!**" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "  Are you sure? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "  Cancelled." -ForegroundColor Yellow
        return
    }
    dotnet ef database drop --project $API_PROJECT --force
    dotnet ef database update --project $API_PROJECT
    Write-Host "[DB-RESET] Database reset completed." -ForegroundColor Green
}

# ============================================================
# Testing Commands
# ============================================================

function Invoke-Health {
    Write-Host "[HEALTH] Checking API health..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get -TimeoutSec 5
        Write-Host "[HEALTH] Status: $response" -ForegroundColor Cyan
    } catch {
        Write-Host "[HEALTH] API is not running or unreachable." -ForegroundColor Red
    }
}

function Invoke-Swag {
    Write-Host "[SWAG] Opening Swagger UI..." -ForegroundColor Green
    Start-Process "$API_URL/swagger"
}

function Invoke-TestApi {
    Write-Host ""
    Write-Host "=== Creating test Item ===" -ForegroundColor Yellow
    $itemBody = @{
        itemCode    = "TEST-001"
        itemName    = "Test Item"
        description = "Smoke test item"
        unit        = "PCS"
    } | ConvertTo-Json

    try {
        $item = Invoke-RestMethod -Uri "$API_URL/api/v1/items" -Method Post -Body $itemBody -ContentType "application/json"
        Write-Host ($item | ConvertTo-Json -Depth 5) -ForegroundColor Green
    } catch {
        Write-Host "Item creation failed (may already exist): $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "=== Creating test Supplier ===" -ForegroundColor Yellow
    $supplierBody = @{
        supplierCode  = "SUP-001"
        supplierName  = "Test Supplier"
        contactPerson = "John Doe"
        email         = "john@test.com"
        phone         = "0901234567"
        address       = "123 Test Street"
    } | ConvertTo-Json

    try {
        $supplier = Invoke-RestMethod -Uri "$API_URL/api/v1/suppliers" -Method Post -Body $supplierBody -ContentType "application/json"
        Write-Host ($supplier | ConvertTo-Json -Depth 5) -ForegroundColor Green
    } catch {
        Write-Host "Supplier creation failed (may already exist): $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "=== Listing Items ===" -ForegroundColor Yellow
    try {
        $items = Invoke-RestMethod -Uri "$API_URL/api/v1/items" -Method Get
        Write-Host ($items | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
    } catch {
        Write-Host "Failed to list items: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "=== Listing Suppliers ===" -ForegroundColor Yellow
    try {
        $suppliers = Invoke-RestMethod -Uri "$API_URL/api/v1/suppliers" -Method Get
        Write-Host ($suppliers | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
    } catch {
        Write-Host "Failed to list suppliers: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "=== Smoke test completed ===" -ForegroundColor Green
}

# ============================================================
# Infrastructure Commands
# ============================================================

function Invoke-InfraUp {
    Write-Host "[INFRA] Starting MySQL + Redis..." -ForegroundColor Green
    docker compose -f "$DEPLOY_DIR/docker-compose.yml" up -d
    Write-Host "[INFRA] Infrastructure started. MySQL: 3306, Redis: 6379" -ForegroundColor Cyan
}

function Invoke-InfraDown {
    Write-Host "[INFRA] Stopping containers..." -ForegroundColor Green
    docker compose -f "$DEPLOY_DIR/docker-compose.yml" down
    Write-Host "[INFRA] Infrastructure stopped." -ForegroundColor Cyan
}

function Invoke-InfraLogs {
    docker compose -f "$DEPLOY_DIR/docker-compose.yml" logs -f
}

function Invoke-InfraPs {
    docker compose -f "$DEPLOY_DIR/docker-compose.yml" ps
}

# ============================================================
# Deployment Commands
# ============================================================

function Invoke-Deploy {
    Write-Host "[DEPLOY] Deploying to $REMOTE_HOST..." -ForegroundColor Green
    scp "$DEPLOY_DIR/docker-compose.yml" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/docker-compose.yml"
    ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd $REMOTE_PATH ; docker compose up -d"
    Write-Host "[DEPLOY] Deployment to $REMOTE_HOST completed." -ForegroundColor Cyan
}

# ============================================================
# Command Router
# ============================================================

switch ($Command.ToLower()) {
    "help"       { Show-Help }
    "run"        { Invoke-Run }
    "build"      { Invoke-Build }
    "clean"      { Invoke-Clean }
    "restore"    { Invoke-Restore }
    "migrate"    { Invoke-Migrate }
    "migration"  { Invoke-Migration }
    "sql"        { Invoke-Sql }
    "db-reset"   { Invoke-DbReset }
    "health"     { Invoke-Health }
    "swag"       { Invoke-Swag }
    "test-api"   { Invoke-TestApi }
    "infra-up"   { Invoke-InfraUp }
    "infra-down" { Invoke-InfraDown }
    "infra-logs" { Invoke-InfraLogs }
    "infra-ps"   { Invoke-InfraPs }
    "deploy"     { Invoke-Deploy }
    default      {
        Write-Host "[ERROR] Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
