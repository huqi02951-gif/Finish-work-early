#!/bin/bash
# Backend deployment script for Hostuno (s2.hostuno.com)
# Run this AFTER uploading the backend folder to the server

set -e

echo "=== Finish Work Early - Backend Deployment ==="

# 1. Install dependencies
echo "[1/5] Installing dependencies..."
npm install --production

# 2. Generate Prisma Client
echo "[2/5] Generating Prisma Client..."
npx prisma generate

# 3. Sync database schema
echo "[3/5] Syncing database schema..."
npx prisma db push --accept-data-loss

# 4. Build
echo "[4/5] Building..."
npm run build

# 5. Start with PM2
echo "[5/5] Starting with PM2..."
pm2 delete finishwork-api 2>/dev/null || true
pm2 start dist/main.js --name "finishwork-api"
pm2 save

echo ""
echo "=== Deployment Complete ==="
echo "API should be running on http://localhost:3000"
echo "Check status: pm2 status"
echo "Check logs: pm2 logs finishwork-api"
