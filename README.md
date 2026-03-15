# FinanceAI - AI Financial Advisor

AI-powered osobný finančný poradca pre slovenský trh s integráciou tradičných financií a crypto portfólia.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query + Zustand
- React Router v6
- Recharts

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL 15
- Redis
- Claude API (Anthropic)

## Štart projektu

### 1. Klonovanie a inštalácia

```bash
git clone https://github.com/DusanOravsky/finance_advisor.git
cd finance_advisor
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edituj .env a nastav API klúče
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

### 4. Spustenie databázy

```bash
# V roote projektu
docker-compose up -d
```

### 5. Prisma migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 6. Spustenie development serverov

```bash
# Backend (terminál 1)
cd backend
npm run dev

# Frontend (terminál 2)
cd frontend
npm run dev
```

### 7. Prístup k aplikácii

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

## Development

```bash
# Prisma Studio (database GUI)
cd backend
npx prisma studio

# Linting
npm run lint

# Formatting
npm run format
```

## Implementačný plán

Pozri `CLAUDE.md` pre detailný plán všetkých fáz (Phase 1-11).

## License

MIT
