#!/bin/bash
# ============================================
# Server Setup Script for Price Management Tool
# Target: Ubuntu/Debian server at 20.20.20.120
# Run as root: bash setup-server.sh
# ============================================

set -e

echo "=========================================="
echo " Price Management Tool - Server Setup"
echo "=========================================="

# ========================================
# 1. Update system packages
# ========================================
echo "[1/4] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ========================================
# 2. Install MySQL 8
# ========================================
echo "[2/4] Installing MySQL 8..."
apt-get install -y mysql-server mysql-client

# Start and enable MySQL service
systemctl start mysql
systemctl enable mysql

# Secure MySQL and create database
echo "[2/4] Configuring MySQL database..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS price_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'priceadmin'@'%' IDENTIFIED BY 'P@ssw0rd123';
GRANT ALL PRIVILEGES ON price_management.* TO 'priceadmin'@'%';
FLUSH PRIVILEGES;
EOF

# Allow remote connections (bind to 0.0.0.0)
if grep -q "bind-address" /etc/mysql/mysql.conf.d/mysqld.cnf 2>/dev/null; then
    sed -i 's/bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
elif grep -q "bind-address" /etc/mysql/my.cnf 2>/dev/null; then
    sed -i 's/bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/' /etc/mysql/my.cnf
fi

systemctl restart mysql
echo "  ✅ MySQL 8 installed and configured"

# ========================================
# 3. Install Redis
# ========================================
echo "[3/4] Installing Redis..."
apt-get install -y redis-server

# Configure Redis to listen on all interfaces
sed -i 's/^bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf 2>/dev/null || true
sed -i 's/^protected-mode yes/protected-mode no/' /etc/redis/redis.conf 2>/dev/null || true

# Start and enable Redis service
systemctl start redis-server
systemctl enable redis-server
echo "  ✅ Redis installed and configured"

# ========================================
# 4. Install .NET 10 Runtime (for running the API)
# ========================================
echo "[4/4] Installing .NET 10 Runtime..."
wget -q https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm -f packages-microsoft-prod.deb
apt-get update -y
apt-get install -y aspnetcore-runtime-10.0 || echo "  ⚠️ .NET 10 runtime not available in apt - may need manual install"

# ========================================
# Verify installations
# ========================================
echo ""
echo "=========================================="
echo " Installation Summary"
echo "=========================================="
echo -n "MySQL:  "; mysql --version 2>/dev/null || echo "NOT FOUND"
echo -n "Redis:  "; redis-server --version 2>/dev/null || echo "NOT FOUND"
echo -n ".NET:   "; dotnet --version 2>/dev/null || echo "NOT FOUND"
echo ""
echo "MySQL Database: price_management"
echo "MySQL User:     priceadmin / P@ssw0rd123"
echo "MySQL Port:     3306"
echo "Redis Port:     6379"
echo ""
echo "=========================================="
echo " ✅ Server setup complete!"
echo "=========================================="
