# FinanceAI - AI Financial Advisor 🚀

AI-powered osobný finančný poradca pre slovenský trh s integráciou tradičných financií a crypto portfólia.

## ✨ Features (Phases 1-4 Completed)

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

✅ **Demo Data**
- Pre-seeded demo account
- Real-world portfolio example
- Sample transactions & goals

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
- PostgreSQL 15
- Git

### 1. Klonovanie repozitára

```bash
git clone https://github.com/DusanOravsky/finance_advisor.git
cd finance_advisor
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edituj `.env` a nastav:
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Claude API key
- `JWT_SECRET` - random string (min 32 chars)
- `JWT_REFRESH_SECRET` - random string (min 32 chars)

### 3. Databáza setup

```bash
# Spusti PostgreSQL (lokálne alebo Docker)
# Potom spusti Prisma migrations
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
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
- 🔲 **Phase 5:** Market Data & Real Prices (CoinGecko, Alpha Vantage)
- 🔲 **Phase 6:** Insurance Management (SK insurers)
- 🔲 **Phase 7:** Data Import/Export (CSV, JSON, PDF)
- 🔲 **Phase 8:** Notifications & Reports
- 🔲 **Phase 9:** Polish & Settings (dark mode, i18n)
- 🔲 **Phase 10:** Testing & Deployment
- 🔲 **Phase 11:** Web3 Extension (optional)

Detailný plán: `CLAUDE.md`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_ai"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"
ANTHROPIC_API_KEY="sk-ant-api03-your-key"
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
