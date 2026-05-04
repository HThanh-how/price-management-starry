# ============================================
# Multi-stage Dockerfile for Price Management API
# Stage 1: Build | Stage 2: Runtime
# ============================================

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first for layer caching optimization
COPY src/PriceManagement.Domain/PriceManagement.Domain.csproj src/PriceManagement.Domain/
COPY src/PriceManagement.Application/PriceManagement.Application.csproj src/PriceManagement.Application/
COPY src/PriceManagement.Api/PriceManagement.Api.csproj src/PriceManagement.Api/

# Restore dependencies (cached if csproj files haven't changed)
RUN dotnet restore src/PriceManagement.Api/PriceManagement.Api.csproj

# Copy all source code
COPY src/ src/

# Build and publish
RUN dotnet publish src/PriceManagement.Api/PriceManagement.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Runtime stage (smaller image, no SDK)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy published output from build stage
COPY --from=build /app/publish .

# Create logs directory
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "PriceManagement.Api.dll"]
