#!/bin/bash
# Backend deployment script for Hostuno (FreeBSD shared hosting)

set -e

echo "=== Finish Work Early - Backend Deployment ==="

if [ ! -f .env ]; then
  echo "Missing backend/.env"
  exit 1
fi

set -a
. ./.env
set +a

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

PSQL_DATABASE_URL="${DATABASE_URL%\?schema=public}"

echo "[1/6] Installing dependencies..."
npm install

echo "[2/6] Generating Prisma Client..."
npx prisma generate

echo "[3/6] Applying SQL migrations..."
psql "$PSQL_DATABASE_URL" -f prisma/manual/20260412_legacy_dev_upgrade.sql || true
psql "$PSQL_DATABASE_URL" -f prisma/manual/20260412_phase2_content_platform.sql

echo "[4/6] Seeding data..."
node prisma/seed.js

echo "[5/6] Building..."
npm run build

echo "[6/6] Starting with PM2..."
if [ ! -x ./node_modules/.bin/pm2 ]; then
  npm install --no-save pm2
fi

./node_modules/.bin/pm2 delete finishwork-api 2>/dev/null || true
./node_modules/.bin/pm2 start dist/main.js --name finishwork-api --update-env
./node_modules/.bin/pm2 save || true

echo ""
echo "=== Deployment Complete ==="
echo "API should be running on http://127.0.0.1:${PORT:-3000}/api/v1"
echo "Check status: ./node_modules/.bin/pm2 status"
echo "Check logs: ./node_modules/.bin/pm2 logs finishwork-api"
