#!/bin/bash
# ProStop — скрипт быстрого деплоя на Vercel
# Использование: ./deploy.sh

set -e

echo "🚀 ProStop — быстрый деплой на Vercel"
echo "======================================="

# Проверяем, установлен ли Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "📦 Устанавливаю Vercel CLI..."
  npm i -g vercel
fi

# Проверяем, залогинен ли пользователь
echo ""
echo "📋 Проверяю авторизацию Vercel..."
if ! vercel whoami &> /dev/null; then
  echo "🔑 Нужно залогиниться:"
  vercel login
fi

echo ""
echo "🎯 Деплою ProStop..."
echo ""

# Если есть аргумент --prod, деплоим в прод
if [[ "$1" == "--prod" ]]; then
  echo "🌍 Деплой в PRODUCTION..."
  vercel --prod
else
  echo "👀 Деплой в PREVIEW (для продакшна: ./deploy.sh --prod)"
  vercel
fi

echo ""
echo "✅ Готово! ProStop задеплоен."
