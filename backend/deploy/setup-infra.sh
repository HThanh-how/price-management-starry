#!/bin/bash
# Infrastructure setup script for Price Management Tool

echo "Setting up infrastructure (MySQL + Redis)..."

# Ensure docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Ensure docker-compose is available
COMPOSE_CMD="docker compose"
if ! command -v docker compose &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        echo "Docker Compose is not installed."
        exit 1
    fi
fi

# Create volume directories with proper permissions
mkdir -p mysql-data;
mkdir -p redis-data;

# Start containers in background
echo "Starting containers..."
$COMPOSE_CMD up -d;

echo "Waiting for MySQL to become ready..."
# Use strict loop to check mysql health
MAX_TRIES=30
TRIES=0
while [ $TRIES -lt $MAX_TRIES ]; do
    HEALTH_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' price_mgmt_db 2>/dev/null)
    if [ "$HEALTH_STATUS" = "\"healthy\"" ]; then
        echo "MySQL is healthy and ready!"
        break
    fi
    echo "Waiting... ($TRIES/$MAX_TRIES)"
    sleep 3
    TRIES=$((TRIES + 1))
done

if [ $TRIES -eq $MAX_TRIES ]; then
    echo "Warning: MySQL health check timed out. Container might still be starting."
    echo "Use 'docker logs price_mgmt_db' to check."
    exit 1
fi

echo "Infrastructure is fully set up and running."
