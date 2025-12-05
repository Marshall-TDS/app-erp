#!/bin/bash

# Script de deploy manual para servidor VPS
# Uso: ./scripts/deploy.sh [homolog|main]

set -e

ENVIRONMENT=${1:-homolog}
PROJECT_DIR="/var/www/app-erp"

if [ "$ENVIRONMENT" != "homolog" ] && [ "$ENVIRONMENT" != "main" ]; then
  echo "❌ Ambiente inválido. Use 'homolog' ou 'main'"
  exit 1
fi

echo "🚀 Iniciando deploy para ambiente: $ENVIRONMENT"

cd "$PROJECT_DIR"

# Determinar branch e container baseado no ambiente
if [ "$ENVIRONMENT" == "homolog" ]; then
  BRANCH="homolog"
  CONTAINER="app-erp-homolog"
else
  BRANCH="main"
  CONTAINER="app-erp-main"
fi

# Fazer pull da branch
echo "📥 Fazendo pull da branch $BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Parar container se estiver rodando
echo "🛑 Parando container $CONTAINER..."
docker-compose stop "$CONTAINER" || true
docker-compose rm -f "$CONTAINER" || true

# Rebuild e iniciar container
echo "🔨 Rebuild e iniciando container $CONTAINER..."
echo "⚠️  Certifique-se de que as variáveis de ambiente estão configuradas no .env ou exportadas"
docker-compose build "$CONTAINER"
docker-compose up -d "$CONTAINER"

# Limpar imagens antigas
echo "🧹 Limpando imagens antigas..."
docker image prune -f

# Verificar status
echo "⏳ Aguardando container iniciar..."
sleep 5

echo "📊 Status do container:"
docker-compose ps "$CONTAINER"

echo "✅ Deploy concluído com sucesso para $ENVIRONMENT!"

