#!/bin/bash

# Script para iniciar o projeto completo
# Execute com: ./start-dev.sh

echo "🚀 Iniciando Gestão de Gastos Compartilhados..."

# Função para matar processos na saída
cleanup() {
    echo "⏹️  Parando serviços..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit
}

# Interceptar Ctrl+C
trap cleanup SIGINT

echo "📦 Frontend: Instalando dependências..."
pnpm install

echo "📦 Backend: Instalando dependências..."
cd backend && pnpm install && cd ..

echo "🗄️  Configurando banco de dados..."
cd backend && pnpm db:generate && pnpm db:push && cd ..

echo "🌐 Iniciando Frontend (http://localhost:3000)..."
pnpm dev &
FRONTEND_PID=$!

echo "⚙️  Iniciando Backend (http://localhost:3001)..."
cd backend && pnpm dev &
BACKEND_PID=$!
cd ..

echo "✅ Serviços iniciados!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços"

# Aguardar
wait
