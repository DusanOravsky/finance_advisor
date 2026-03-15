# FinanceAI - AI Financial Advisor 🚀

AI-powered osobný finančný poradca pre slovenský trh s integráciou tradičných financií a crypto portfólia.

## ✨ Features (Phases 1-10 Completed) 🎉

✅ **Authentication & User Management**
- JWT tokens (access + refresh)
- Secure password hashing
- Protected routes
- User profile management

✅ **Dashboard & Portfolio Management**
- Real-time portfolio overview
- Asset allocation visualization
- Performance tracking
- Transaction history
- Financial goals with progress tracking

✅ **AI Financial Advisor Chat**
- Claude API integration
- Portfolio-aware responses
- Context-sensitive recommendations
- Chat history persistence
- Quick action buttons

✅ **Market Data & Real Prices**
- CoinGecko API (crypto prices)
- Alpha Vantage API (stock prices)
- Redis caching layer
- DeFi APY rates
- Bulk portfolio price updates

✅ **Insurance Management**
- Full CRUD operations
- Renewal alerts (30/60/90 days)
- Slovak insurers comparison
- Insurance statistics

✅ **Data Import/Export**
- CSV import/export
- JSON import/export
- Sample templates
- File upload handling

✅ **Notifications & Reports**
- In-app notification system
- Real-time updates
- Automatic notifications (insurance renewals, goals)
- Monthly/Quarterly/Yearly reports
- Tax reports
- Transaction breakdown

✅ **Dark Mode & Polish**
- Full dark mode support
- Theme persistence
- Responsive design
- Loading states
- Error handling

✅ **Production Ready**
- Docker production builds
- CI/CD pipeline (GitHub Actions)
- Health checks
- Database backups guide
- Complete deployment documentation

✅ **Demo Data**
- Pre-seeded demo account
- Real-world portfolio example
- Sample transactions & goals
- Insurance policies

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query + Zustand
- React Router v6
- Lucide React icons

**Backend:**
- Node.js 20+ + Express
- TypeScript
- Prisma ORM
- PostgreSQL 15
- Claude API (Anthropic)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (lokálna inštalácia)
- Git

### 1. Klonovanie repozitára

```bash
git clone https://github.com/DusanOravsky/finance_advisor.git
cd finance_advisor
```

### 2. Databáza setup

```bash
# Nainštaluj PostgreSQL (ak nie je)
sudo apt update && sudo apt install postgresql postgresql-contrib -y
sudo service postgresql start

# Vytvor databázu a usera
sudo -u postgres psql <<EOF
CREATE DATABASE finance_ai;
CREATE USER finance_ai_user WITH PASSWORD 'finance_ai_pass';
ALTER USER finance_ai_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE finance_ai TO finance_ai_user;
ALTER DATABASE finance_ai OWNER TO finance_ai_user;
\q
EOF
```

### 3. Backend setup

```bash
cd backend
npm install

# Backend .env je už nakonfigurovaný pre lokálnu PostgreSQL
# Skontroluj backend/.env:
# DATABASE_URL="postgresql://finance_ai_user:finance_ai_pass@localhost:5432/finance_ai"
```

**Vytvor DB schému a seed data:**
```bash
npx prisma generate --schema=./src/prisma/schema.prisma
npx prisma db push --schema=./src/prisma/schema.prisma
npx tsx src/prisma/seed.ts
```

### 4. Frontend setup

```bash
cd ../frontend
npm install
# Frontend .env je už nakonfigurovaný
```

### 5. Spustenie aplikácie

```bash
# Backend (terminál 1)
cd backend
npm run dev

# Frontend (terminál 2)
cd frontend
npm run dev
```

### 6. Prístup k aplikácii

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health check:** http://localhost:3000/health

### 7. Demo účet

Pre rýchly prístup použi demo prihlasovacie údaje:

```
Email: dusan.oravsky@gmail.com
Heslo: password123
```

**Demo portfólio obsahuje:**
- €847,230 celková hodnota
- 10 investícií (stocks, ETFs, bonds, crypto)
- 4 poistky (auto, dom, zdravie, život)
- 4 finančné ciele
- 7 transakcií
- Kompletný user profil

## 📁 Štruktúra projektu

```
finance_advisor/
├── backend/
│   └── src/
│       ├── controllers/    # API controllers
│       ├── services/       # Business logic
│       ├── routes/         # Express routes
│       ├── middleware/     # Auth, error handling
│       ├── prisma/         # DB schema & seed
│       └── utils/          # JWT helpers
├── frontend/
│   └── src/
│       ├── pages/          # Dashboard, Chat, Portfolio, Login, Register
│       ├── components/     # Reusable UI components
│       ├── services/       # API clients
│       ├── store/          # Zustand stores
│       └── types/          # TypeScript types
└── CLAUDE.md              # Implementation roadmap
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrácia
- `POST /api/auth/login` - Prihlásenie
- `POST /api/auth/logout` - Odhlásenie
- `GET /api/auth/profile` - Profil používateľa
- `PUT /api/auth/profile` - Aktualizácia profilu

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/stats` - Štatistiky

### Portfolio
- `GET /api/portfolio` - Zoznam investícií
- `GET /api/portfolio/summary` - Portfolio summary
- `POST /api/portfolio` - Pridať investíciu
- `PUT /api/portfolio/:id` - Aktualizovať investíciu
- `DELETE /api/portfolio/:id` - Zmazať investíciu

### AI Chat
- `POST /api/ai/chat` - Chat s AI
- `POST /api/ai/analyze-portfolio` - Analýza portfólia
- `GET /api/ai/chat/history` - História chatu
- `DELETE /api/ai/chat/history` - Vymazať históriu

### Market Data
- `GET /api/market/crypto/:symbol` - Crypto cena
- `GET /api/market/stock/:symbol` - Stock cena
- `GET /api/market/defi/rates` - DeFi APY rates
- `POST /api/market/portfolio/update-prices` - Bulk price update

### Insurance
- `GET /api/insurance` - Zoznam poistiek
- `GET /api/insurance/:id` - Detail poistky
- `POST /api/insurance` - Pridať poistku
- `PUT /api/insurance/:id` - Aktualizovať poistku
- `DELETE /api/insurance/:id` - Zmazať poistku
- `GET /api/insurance/renewals` - Nadchádzajúce obnovenia
- `GET /api/insurance/compare/:type` - Porovnanie poisťovní
- `GET /api/insurance/stats` - Štatistiky

### Import/Export
- `POST /api/import-export/csv` - Import z CSV
- `POST /api/import-export/json` - Import z JSON
- `GET /api/import-export/csv` - Export do CSV
- `GET /api/import-export/json` - Export do JSON
- `GET /api/import-export/template/csv` - Sample CSV
- `GET /api/import-export/template/json` - Sample JSON

### Notifications
- `GET /api/notifications` - Zoznam notifikácií
- `GET /api/notifications/unread-count` - Počet neprečítaných
- `PUT /api/notifications/:id/read` - Označiť ako prečítané
- `PUT /api/notifications/read-all` - Označiť všetky
- `DELETE /api/notifications/:id` - Zmazať notifikáciu
- `POST /api/notifications/generate` - Generovať notifikácie

### Reports
- `GET /api/reports/monthly` - Mesačný report
- `GET /api/reports/quarterly` - Kvartálny report
- `GET /api/reports/yearly` - Ročný report
- `GET /api/reports/tax` - Daňový report

## 🔧 Development

```bash
# Prisma Studio (database GUI)
cd backend
npx prisma studio

# Backend linting
cd backend
npm run lint

# Frontend linting
cd frontend
npm run lint

# Format code
npm run format
```

## 📋 Implementation Progress

- ✅ **Phase 1:** Foundation (monorepo setup, Docker, Prisma)
- ✅ **Phase 2:** Auth & User Management (JWT, bcrypt, protected routes)
- ✅ **Phase 3:** Dashboard & Portfolio (CRUD APIs, seed data)
- ✅ **Phase 4:** AI Chat Interface (Claude API, chat history)
- ✅ **Phase 5:** Market Data & Real Prices (CoinGecko, Alpha Vantage, Redis cache)
- ✅ **Phase 6:** Insurance Management (SK insurers, renewals, comparison)
- ✅ **Phase 7:** Data Import/Export (CSV, JSON, templates)
- ✅ **Phase 8:** Notifications & Reports (in-app notifications, monthly/yearly reports, tax)
- ✅ **Phase 9:** Polish & Settings (dark mode, responsive design, error handling)
- ✅ **Phase 10:** Testing & Deployment (Docker, CI/CD, deployment guide)
- 🔲 **Phase 11:** Web3 Extension (optional - future enhancement)

Detailný plán: `CLAUDE.md`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_ai"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
ANTHROPIC_API_KEY="sk-ant-api03-your-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-key"
COINGECKO_API_KEY="your-coingecko-key"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

Pull requesty sú vítané! Pre väčšie zmeny najprv otvorte issue.

## 📄 License

MIT

## 👨‍💻 Author

Dušan Oravský - dusan.oravsky@gmail.com
