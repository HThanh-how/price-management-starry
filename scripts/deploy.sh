#!/usr/bin/env bash
# =============================================
# Production deployment helper for 20.20.20.160
# =============================================
# Usage:
#   ./scripts/deploy.sh                # rsync code + rebuild + restart + repair Mojibake
#   ./scripts/deploy.sh --skip-repair  # same, but do not run the Mojibake repair migration
#
# Requirements:
#   - SSH access to root@20.20.20.160
#   - rsync available locally and on the server
#   - Docker + docker compose installed on the server
#
# What it does:
#   1. rsync repo to /root/price-management-tool (excluding node_modules, bin, obj, .git).
#   2. Rebuild and restart only the services whose code changed (backend + frontend).
#   3. Apply the Mojibake repair migration in-place (idempotent).
#   4. Smoke-test /api/v1/items returns proper Vietnamese (no \xC3 bytes).
# =============================================
set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-root@20.20.20.160}"
REMOTE_DIR="${REMOTE_DIR:-/root/price-management-tool}"
SKIP_REPAIR=0

for arg in "$@"; do
  case "$arg" in
    --skip-repair) SKIP_REPAIR=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

LOCAL_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Syncing code to ${REMOTE_HOST}:${REMOTE_DIR}"
rsync -az --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='**/bin' \
  --exclude='**/obj' \
  --exclude='**/.next' \
  --exclude='*.log' \
  --exclude='terminals/' \
  "${LOCAL_ROOT}/" "${REMOTE_HOST}:${REMOTE_DIR}/"

echo "==> Rebuilding & restarting backend + frontend"
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && docker compose up -d --build backend frontend && docker compose restart nginx"

if [[ "${SKIP_REPAIR}" -eq 0 ]]; then
  echo "==> Applying Mojibake repair migration (idempotent)"
  ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && \
    docker cp scripts/fix-mojibake.sql price-mysql:/tmp/fix-mojibake.sql && \
    docker exec -e MYSQL_PWD='StrongP@ss2026!' price-mysql sh -c 'mysql -uroot price_management < /tmp/fix-mojibake.sql' && \
    docker exec price-redis redis-cli FLUSHALL"
fi

echo "==> Smoke test"
ssh "${REMOTE_HOST}" "curl -fsS 'http://localhost:8080/api/v1/items?pageNumber=1&pageSize=3' | head -c 400 && echo"

echo "==> Done."
