#!/usr/bin/env bash
# Запускать на VPS из корня проекта: ./scripts/deploy.sh
# Или через GitHub Actions (см. .github/workflows/deploy.yml)

set -e

echo ">>> git pull..."
git pull

echo ">>> npm ci..."
npm ci

echo ">>> npm run build..."
npm run build

echo ">>> pm2 restart who-i-am..."
pm2 restart who-i-am --update-env

echo ">>> deploy done"
