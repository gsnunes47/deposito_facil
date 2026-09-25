#!/usr/bin/env bash

set -e

export NVM_DIR="/home/deploy/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

nvm use 22

echo "Node: $(node -v)"
echo "NPM: $(npm -v)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📥 Atualizando repositório..."

git fetch origin
git reset --hard origin/main
git clean -fd

echo "📦 Instalando dependências do backend..."
cd "$ROOT_DIR/backend"
npm ci

echo "🗄️ Aplicando migrations..."
npx prisma migrate deploy

echo "🔨 Buildando backend..."
cd "$ROOT_DIR/backend"
npm run build

echo "📦 Instalando dependências do frontend..."
cd "$ROOT_DIR/frontend"
npm ci

echo "🎨 Buildando frontend..."
npm run build

echo "🚀 Reiniciando PM2..."
pm2 restart deposito-facil-api
pm2 restart deposito-facil-frontend

sleep 3

echo "🔎 Validando processos..."

API_STATUS="$(pm2 jlist | node -e "
let d='';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  const apps = JSON.parse(d);
  const app = apps.find(x => x.name === 'deposito-facil-api');
  console.log(app?.pm2_env?.status || 'missing');
});
")"

FRONT_STATUS="$(pm2 jlist | node -e "
let d='';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  const apps = JSON.parse(d);
  const app = apps.find(x => x.name === 'deposito-facil-frontend');
  console.log(app?.pm2_env?.status || 'missing');
});
")"

echo "API: $API_STATUS"
echo "Frontend: $FRONT_STATUS"

if [ "$API_STATUS" != "online" ] || [ "$FRONT_STATUS" != "online" ]; then
  echo "❌ Deploy falhou: processo PM2 fora do ar"
  pm2 status
  exit 1
fi

echo "✅ Deploy concluído!"
pm2 status