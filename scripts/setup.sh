#!/bin/bash
set -e
echo "🐟 Escama Platform — Setup"
echo "================================"
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "✏️  Edite .env.local com DATABASE_URL e AUTH_SECRET, depois corra o script novamente."
  exit 1
fi
echo "📦 Instalando dependências..."
npm install
echo "🔧 Gerando Prisma client..."
npx prisma generate
echo "🗄️  Aplicando schema na base de dados..."
npx prisma db push
echo "🌱 Populando base de dados..."
npm run db:seed
echo ""
echo "✅ Setup completo! Corra: npm run dev"
echo "Admin:   admin@escama.ao / admin123456"
echo "Cliente: ana@example.com / customer123"
