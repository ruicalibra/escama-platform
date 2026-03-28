# 🐟 Escama Platform

Plataforma de e-commerce de peixe e marisco fresco, construída com **Next.js 15**, **PostgreSQL**, **Prisma ORM**, **NextAuth v5** e **Tailwind CSS**.

---

## Estrutura do Projecto

```
escama-platform/
├── prisma/
│   ├── schema.prisma          # Schema completo (25+ modelos)
│   └── seed.ts                # Dados iniciais (tenant, produtos, categorias)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Registo
│   │   ├── (client)/          # App cliente (home, catálogo, cart, checkout, perfil)
│   │   ├── (admin)/           # Backoffice admin
│   │   ├── (courier)/         # App estafeta
│   │   └── api/               # API Routes
│   │       ├── auth/          # NextAuth + register
│   │       ├── products/      # CRUD produtos
│   │       ├── orders/        # CRUD encomendas
│   │       ├── categories/    # Categorias
│   │       ├── dashboard/     # Stats
│   │       ├── users/         # Gestão utilizadores
│   │       ├── suppliers/     # Fornecedores
│   │       └── stock/         # Stock diário
│   ├── components/
│   │   ├── admin/             # Componentes backoffice
│   │   ├── client/            # Componentes app cliente
│   │   ├── shared/            # Providers
│   │   └── ui/                # Componentes UI reutilizáveis
│   ├── hooks/
│   │   └── useCartStore.ts    # Carrinho (Zustand + persist)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma singleton
│   │   ├── utils.ts           # Helpers
│   │   ├── tenant.ts          # Multi-tenant helpers
│   │   └── validations/       # Zod schemas
│   ├── middleware.ts           # Protecção de rotas
│   └── types/index.ts         # TypeScript types
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Instalação Local (passo a passo)

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ (local ou Supabase)
- npm ou pnpm

### 1. Clonar e instalar

```bash
git clone <repositório>
cd escama-platform
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
# PostgreSQL — exemplo local
DATABASE_URL="postgresql://postgres:password@localhost:5432/escama"

# NextAuth — gerar com: openssl rand -base64 32
AUTH_SECRET="cole-aqui-uma-string-aleatoria-longa"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_TENANT_SLUG="escama-ao"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Criar a base de dados

```bash
# Criar a DB no PostgreSQL
psql -U postgres -c "CREATE DATABASE escama;"

# Aplicar o schema via Prisma
npx prisma db push

# Popular com dados iniciais
npm run db:seed
```

> **Supabase (alternativa):**
> 1. Criar projecto em supabase.com
> 2. Copiar a connection string de `Settings > Database`
> 3. Colar em `DATABASE_URL` no `.env.local`
> 4. Correr `npx prisma db push && npm run db:seed`

### 4. Iniciar o servidor

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Credenciais Demo

| Utilizador | Email | Password | Acesso |
|---|---|---|---|
| Admin | `admin@escama.ao` | `admin123456` | Backoffice completo |
| Cliente | `ana@example.com` | `customer123` | App cliente |

---

## Rotas Principais

| URL | Descrição |
|---|---|
| `/login` | Login / Registo |
| `/home` | App cliente — Homepage |
| `/catalogue` | Catálogo de produtos |
| `/catalogue/[id]` | Detalhe do produto |
| `/cart` | Carrinho |
| `/checkout` | Checkout |
| `/profile` | Perfil do cliente |
| `/admin/dashboard` | Backoffice — Dashboard |
| `/admin/orders` | Backoffice — Encomendas |
| `/admin/products` | Backoffice — Produtos (CRUD) |
| `/admin/stock` | Backoffice — Stock diário |
| `/admin/suppliers` | Backoffice — Fornecedores |
| `/admin/customers` | Backoffice — Clientes |
| `/courier/orders` | App estafeta |

---

## API Routes

| Método | URL | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Criar conta | Público |
| `GET` | `/api/products` | Listar produtos | Público |
| `POST` | `/api/products` | Criar produto | Admin |
| `GET` | `/api/products/[id]` | Detalhe produto | Público |
| `PATCH` | `/api/products/[id]` | Editar produto | Admin |
| `DELETE` | `/api/products/[id]` | Desactivar produto | Admin |
| `GET` | `/api/categories` | Listar categorias | Público |
| `GET` | `/api/orders` | Listar encomendas | Auth |
| `POST` | `/api/orders` | Criar encomenda | Auth |
| `GET` | `/api/orders/[id]` | Detalhe encomenda | Auth |
| `PATCH` | `/api/orders/[id]` | Actualizar estado | Admin/Courier |
| `GET` | `/api/dashboard` | Estatísticas | Admin |
| `GET` | `/api/users` | Listar utilizadores | Admin |
| `GET` | `/api/suppliers` | Listar fornecedores | Público |
| `POST` | `/api/suppliers` | Criar fornecedor | Admin |
| `GET` | `/api/stock` | Stock hoje | Público |
| `POST` | `/api/stock` | Criar lote | Admin/Supplier |

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build produção
npm run build
npm run start

# Base de dados
npm run db:generate    # Regenerar Prisma client
npm run db:push        # Sincronizar schema (dev)
npm run db:migrate     # Criar migração
npm run db:seed        # Popular com dados
npm run db:studio      # Abrir Prisma Studio (UI)
npm run db:reset       # Reset completo (APAGA TUDO)

# Linting
npm run lint
```

---

## Deploy na Vercel

### 1. Preparar repositório

```bash
git init
git add .
git commit -m "feat: escama platform initial"
git remote add origin <seu-repositório>
git push -u origin main
```

### 2. Criar projecto na Vercel

1. [vercel.com/new](https://vercel.com/new) → Importar repositório
2. Framework: **Next.js** (detectado automaticamente)

### 3. Variáveis de ambiente na Vercel

No painel da Vercel → **Settings → Environment Variables**, adicionar:

```
DATABASE_URL          = postgresql://...  (Supabase / Neon / Railway)
AUTH_SECRET           = (openssl rand -base64 32)
NEXTAUTH_URL          = https://seu-dominio.vercel.app
NEXT_PUBLIC_APP_URL   = https://seu-dominio.vercel.app
NEXT_PUBLIC_TENANT_SLUG = escama-ao
GOOGLE_CLIENT_ID      = (opcional)
GOOGLE_CLIENT_SECRET  = (opcional)
```

### 4. Configurar a base de dados para produção

**Opção A — Supabase (recomendado):**
1. [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string (mode: **Session**)
3. Copiar para `DATABASE_URL`

**Opção B — Neon (serverless):**
1. [neon.tech](https://neon.tech) → New project
2. Copiar connection string
3. Adicionar `?sslmode=require` no final

### 5. Migrar base de dados em produção

```bash
# Localmente, apontar para a DB de produção:
DATABASE_URL="postgresql://prod-url..." npx prisma migrate deploy
DATABASE_URL="postgresql://prod-url..." npm run db:seed
```

### 6. Deploy

```bash
git push origin main  # Vercel detecta e faz deploy automático
```

---

## Tecnologias

| Tech | Versão | Uso |
|---|---|---|
| Next.js | 15 | Framework full-stack, App Router |
| React | 19 | UI |
| TypeScript | 5.7 | Tipagem |
| Prisma | 5.22 | ORM, schema, migrations |
| PostgreSQL | 15+ | Base de dados |
| NextAuth v5 | 5.0 beta | Autenticação (credentials + Google) |
| Tailwind CSS | 3.4 | Styling |
| Zustand | 4.5 | Estado cliente (carrinho) |
| Zod | 3.24 | Validação de inputs |
| bcryptjs | 2.4 | Hash de passwords |

---

## Notas de Arquitectura

- **Multi-tenant:** Toda a lógica está isolada por `tenantId`. Para adicionar um novo cliente/marca, basta criar um novo registo em `tenants`.
- **Carrinho:** Persiste no `localStorage` via Zustand. Ao fazer checkout, os dados são enviados para a API e o carrinho é limpo.
- **Autenticação:** JWT strategy. O token inclui `role`, `tenantId` e `tenantSlug` para evitar queries extra por request.
- **Middleware:** Protege rotas `/admin/*` (requer role admin/superadmin/supplier) e `/courier/*` (requer role courier).
- **API Routes:** Sem Express. Todas as rotas usam os Route Handlers nativos do Next.js App Router.
"# escama-platform" 
