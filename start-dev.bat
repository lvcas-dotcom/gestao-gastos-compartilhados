@echo off
echo 🚀 Iniciando Gestão de Gastos Compartilhados...

echo 📦 Frontend: Instalando dependências...
call pnpm install

echo 📦 Backend: Instalando dependências...
cd backend
call pnpm install
cd ..

echo 🗄️  Configurando banco de dados...
cd backend
call pnpm db:generate
call pnpm db:push
cd ..

echo 🌐 Iniciando Frontend (http://localhost:3000)...
start "Frontend" cmd /k "pnpm dev"

echo ⚙️  Iniciando Backend (http://localhost:3001)...
cd backend
start "Backend" cmd /k "pnpm dev"
cd ..

echo ✅ Serviços iniciados!
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
