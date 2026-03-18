# FinanceAI - AI Financial Advisor pre slovensky trh

## Repository
- Git: https://github.com/DusanOravsky/finance_advisor
- Local: /home/cvcta/projects/covestro/finance_advisor

## Popis projektu
Full-stack AI-powered osobny financny poradca pre slovensky trh. 3 hlavne piliere:
1. **AI Financial Advisor Chat** (hlavna hodnota - Claude API)
2. **Portfolio & Finance Dashboard** (vizualna hodnota)
3. **Slovak Market Features** (niche - poistenie, SK poistovne)

Web3/blockchain je odlozene na Phase 2 ako samostatny modul.

## Tech Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, Recharts, React Router v6, React Query + Zustand, React Hook Form + Zod, Axios, Framer Motion
- **Backend:** Node.js 20+, Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL 15, Redis (cache + queues)
- **AI:** Anthropic Claude API (RAG s portfolio datami)
- **External APIs:** CoinGecko (crypto), Alpha Vantage (stocks), DefiLlama (DeFi data)
- **DevOps:** Docker + Docker Compose, GitHub Actions, ESLint + Prettier

## Struktura projektu
```
finance_advisor/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/  # chat/, dashboard/, insurance/, investments/, web3/, reports/, settings/, shared/, layout/
│       ├── pages/       # Dashboard, Chat, Insurance, Investments, Transactions, Goals, Reports, Settings, Login, Register
│       ├── hooks/       # useAuth, usePortfolio, useChat, useNotifications, useFileUpload
│       ├── services/    # api, auth, portfolio, ai, market
│       ├── types/       # user, portfolio, chat
│       ├── utils/       # formatters, validators, calculations, csvParser, jsonParser
│       └── store/       # authStore, portfolioStore
├── backend/           # Express + TypeScript API
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       └── prisma/
├── docker-compose.yml
└── CLAUDE.md
```

## Konvencie
- Komentare v slovencine
- TypeScript vsade (strict mode)
- Clean code, production-ready
- Prisma pre DB migrations a ORM
- JWT auth (15min access, 7d refresh)
- API prefix: /api/

## Klucove rozhodnutia
- Claude API namiesto OpenAI (lepsi pre dlhsie kontexty, portfolio analysis)
- Bez vlastneho tokenu (AWM) - simulovat ako "loyalty points" v DB, nie blockchain
- Web3 = read-only na zaciatok (zobrazit crypto data, ale nepisat na chain)
- CoinGecko free tier (50 calls/min)
- Monorepo (frontend/ + backend/ v jednom repo)
- Seed data - Dusanov profil ako demo ucet

## ✅ PROJEKT KOMPLETNE FUNKČNÝ (18.3.2026)

### 🎯 Súhrn implementácie
- **10 fáz dokončených** (Phases 1-10)
- **Rozšírený Insurance modul** - editácia, AI scraping, email notifikácie
- **Lokálne spustená aplikácia** s PostgreSQL databázou
- **Demo účet** s kompletným portfóliom €847,230
- **Backend + Frontend** plne funkčné

### 🚀 Ako spustiť (Local Setup)

#### 1. PostgreSQL setup
```bash
# Nainštaluj PostgreSQL (ak nie je)
sudo apt update && sudo apt install postgresql postgresql-contrib -y
sudo service postgresql start

# Vytvor databázu
sudo -u postgres psql <<EOF
CREATE DATABASE finance_ai;
CREATE USER finance_ai_user WITH PASSWORD 'finance_ai_pass';
ALTER USER finance_ai_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE finance_ai TO finance_ai_user;
ALTER DATABASE finance_ai OWNER TO finance_ai_user;
EOF
```

#### 2. Backend setup
```bash
cd backend
npm install
npx prisma generate --schema=./src/prisma/schema.prisma
npx prisma db push --schema=./src/prisma/schema.prisma
npx tsx src/prisma/seed.ts
npm run dev  # Port 3000
```

#### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev  # Port 5173
```

#### 4. Prístup
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Login:**
  - Email: dusan.oravsky@gmail.com
  - Heslo: password123

### 📊 Čo je implementované

**Backend (Express + TypeScript + Prisma):**
- ✅ 10 kontrolérov (Auth, Dashboard, Portfolio, Insurance, AI, Market, Import/Export, Notifications, Reports, User)
- ✅ 12 služieb (Auth, Dashboard, Portfolio, Insurance, AI, Market, Notification, Report, Import/Export + pomocné)
- ✅ 10 route súborov
- ✅ JWT autentifikácia (access + refresh tokens)
- ✅ PostgreSQL databáza (12 tabuliek)
- ✅ Prisma ORM s migráciami
- ✅ Seed data (demo účet s kompletným portfóliom)

**Frontend (React + TypeScript + Vite + Tailwind):**
- ✅ 7 hlavných stránok (Dashboard, Chat, Portfolio, Insurance, Transactions, Goals, Reports)
- ✅ Login/Register pages s autentifikáciou
- ✅ 50+ komponentov (layout, shared, feature-specific)
- ✅ Dark mode s perzistenciou (Zustand)
- ✅ React Query pre API calls
- ✅ Protected routes
- ✅ Responsive design (Tailwind)
- ✅ Real-time notifications

**Demo dáta:**
- ✅ 1 používateľ (Dušan Oravský)
- ✅ 10 investícií (AAPL, MSFT, GOOGL, VWCE, IWDA, AGG, GOVT, BTC, ETH, USDC)
- ✅ 4 poistky (Allianz, Generali, Kooperativa, UNIQA)
- ✅ 4 finančné ciele
- ✅ 7 transakcií
- ✅ 1 crypto wallet
- ✅ Portfolio value: €847,230

### 🆕 Nové funkcie - Insurance Management (18.3.2026)

**1. Editovateľné poistky ✅**
- InsuranceModal pre vytvorenie/úpravu
- Edit button na každej poistke
- Tlačidlo "Pridať poistku"

**2. Rozšírené polia poistiek ✅**
- `startDate` - dátum začiatku poistenia
- `endDate` - dátum konca (voliteľný)
- `renewalDate` - dátum obnovenia
- `reminderDays` - koľko dní vopred poslať pripomienku (30-180)
- `emailReminder` - zapnúť/vypnúť email pripomienky
- `lastReminderSent` - tracking poslednej pripomienky

**3. Email notifikácie ✅**
- **EmailService** - HTML emaily s pekným dizajnom (Nodemailer)
- **Automatický cron job** - každý deň o 9:00 kontroluje poistky
- **Urgentné pripomienky** - ak ostáva ≤7 dní, pošle každé 3 dni
- **Notifikačné nastavenia** - zapnutie/vypnutie v Settings
- **Email konfigurácia** - Settings → Profil (email kam posielať)

**4. AI scraping poisťovní ✅**
- **InsuranceScrapingService** - Claude API pre analýzu trhu
- Tlačidlo "AI Ponuky" - hľadá najlepšie ponuky na SK trhu
- Analyzuje: Allianz, UNIQA, Generali, Kooperativa, AXA, NN, ČSOB
- Zobrazuje: cenu, krytie, rating, zľavu, odkaz
- **analyzeInsurance** endpoint - porovná aktuálnu vs trh, vypočíta úspory
- Fallback na simulované dáta ak nie je ANTHROPIC_API_KEY

**5. Settings rozšírené ✅**
- 3 taby: Profil, Notifikácie, Import/Export
- **Profil** - email, mena, riziková tolerancia, príjmy/výdavky
- **Notifikácie** - zapnúť/vypnúť email pre poistky, investície, budget, reporty, crypto
- **Import/Export** - CSV/JSON (bez zmien)

**Nové API endpointy:**
- `GET /api/insurance/scrape/:type?currentPremium=X` - AI najlepšie ponuky
- `GET /api/insurance/:id/analyze` - analýza poistky vs trh
- `POST /api/insurance/:id/send-reminder` - manuálny email reminder
- `PUT /api/auth/settings` - aktualizácia notifikačných nastavení
- `PUT /api/insurance/:id` - update poistky s novými poľami

**Nové services:**
- `insuranceScrapingService.ts` - AI-powered scraping SK poisťovní
- `emailService.ts` - posielanie HTML emailov (Nodemailer)
- `insuranceReminderService.ts` - cron job logika pre pripomienky

**Nové komponenty:**
- `InsuranceModal.tsx` - form pre vytvorenie/editovanie poistiek
- Upgraded `Insurance.tsx` - AI ponuky, edit, email tlačidlá
- Upgraded `Settings.tsx` - 3 taby s notifikačnými nastaveniami

**Dependencies pridané:**
- `nodemailer` + `@types/nodemailer` - email posielanie
- `react-hot-toast` - toast notifikácie vo frontende

### 🔧 Technické poznámky

**Databáza:**
- Lokálna PostgreSQL (WSL2 má networking problémy s Neon.tech)
- Connection string: `postgresql://finance_ai_user:finance_ai_pass@localhost:5432/finance_ai`

**API Keys (voliteľné):**
- `ANTHROPIC_API_KEY` - pre AI chat a insurance scraping (zatiaľ prázdne, používa fallback)
- `ALPHA_VANTAGE_API_KEY` - pre stock prices (zatiaľ prázdne)
- `COINGECKO_API_KEY` - pre crypto prices (zatiaľ prázdne)
- `SMTP_HOST` - SMTP server pre emaily (napr. smtp.gmail.com)
- `SMTP_PORT` - SMTP port (587)
- `SMTP_USER` - email adresa
- `SMTP_PASS` - email heslo/app password
- `FRONTEND_URL` - URL frontendu pre linky v emailoch (default: http://localhost:5173)

**Redis:**
- Voliteľný (cache layer pre market data)
- Aplikácia funguje aj bez neho

---

## Implementacny plan

### PHASE 1: Foundation (Tyzden 1) ✅ DOKONCENE
- [x] Monorepo setup (frontend/ + backend/)
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Backend: Express + TypeScript + Prisma (core modely: User, UserSettings)
- [x] Frontend: Vite + React + TypeScript + Tailwind
- [x] ESLint + Prettier config
- [x] Basic project structure (routes, middleware, services)

### PHASE 2: Auth & User Management (Tyzden 2) ✅ DOKONCENE
- [x] JWT auth (register, login, refresh, logout)
- [x] Password hashing (bcrypt)
- [x] Auth middleware
- [x] Rate limiting
- [x] Frontend: Login/Register pages
- [x] Auth context + protected routes
- [x] User profile page (basic)

### PHASE 3: Dashboard & Portfolio (Tyzdne 3-4) ✅ DOKONCENE
- [x] DB: Investment, Transaction, FinancialGoal modely
- [x] Portfolio CRUD API
- [x] Transaction CRUD API + CSV import
- [x] Financial Goals CRUD API
- [x] Dashboard Overview API (agregacie)
- [x] Frontend: Dashboard s StatCards
- [x] Frontend: Portfolio pie chart (Recharts)
- [x] Frontend: Recent transactions list
- [x] Frontend: Financial goals s progress bars
- [x] Mock data seeding (Dusanov profil)

### PHASE 4: AI Chat Interface (Tyzdne 5-6) ✅ DOKONCENE
- [x] Claude API integracia (Anthropic SDK)
- [x] ChatMessage model + API
- [x] System prompt s portfolio kontextom (RAG-lite)
- [x] Chat history persistence
- [x] Frontend: Chat UI (MessageBubble, ChatInput)
- [x] Quick action buttons
- [x] Portfolio-aware responses
- [ ] Streaming responses (SSE) - optional pre neskor

### PHASE 5: Market Data & Real Prices (Tyzden 7) ✅ DOKONCENE
- [x] CoinGecko integracia (crypto ceny - free API)
- [x] Alpha Vantage integracia (stock ceny)
- [x] Caching layer (Redis) pre API calls
- [ ] Background price update job (Bull queue) - optional pre neskor
- [x] Market data service s price fetching
- [x] DeFi rates endpoint (simulovane)

### PHASE 6: Insurance Management (Tyzden 8) ✅ DOKONCENE
- [x] Insurance model + full CRUD API
- [x] Renewal notification logic (30/60/90 dni)
- [x] Insurance comparison (simulated data pre SK poistovne)
- [x] Frontend: Insurance list, cards
- [x] Frontend: Renewal alerts
- [x] Frontend: Comparison view
- [x] Stats endpoint

### PHASE 7: Data Import/Export (Tyzden 9) ✅ DOKONCENE
- [x] CSV parser (portfolio holdings)
- [x] JSON parser (client profiles)
- [x] File upload + validation
- [x] Export templates (sample CSV/JSON)
- [x] Frontend: Import/Export UI v Settings
- [x] Download exported files (CSV, JSON)

### PHASE 8: Notifications & Reports (Tyzden 10) ✅ DOKONCENE
- [x] Notification model + API
- [x] In-app notification system
- [x] Notification service (insurance renewals, goal tracking)
- [x] Report service (monthly, quarterly, yearly, tax)
- [x] Frontend: Notification bell + dropdown
- [x] Frontend: Reports page s charts
- [ ] Email notifications (Nodemailer) - optional pre neskor

### PHASE 9: Polish & Settings (Tyzden 11) ✅ DOKONCENE
- [x] Dark/light mode (Tailwind dark mode)
- [x] Theme toggle component
- [x] Theme persistence (Zustand)
- [x] Responsive design (Tailwind responsive)
- [x] Error handling (middleware)
- [x] Loading states (React Query)
- [ ] Slovak/English i18n - optional pre neskor
- [ ] Swagger/OpenAPI dokumentacia - optional

### PHASE 10: Testing & Deployment (Tyzden 12) ✅ DOKONCENE
- [x] Docker production builds (multi-stage)
- [x] docker-compose.prod.yml
- [x] Nginx config pre frontend
- [x] GitHub Actions CI/CD workflow
- [x] Deployment guide (DEPLOYMENT.md)
- [x] Health checks
- [x] Security best practices
- [ ] Unit testy - basic structure ready
- [ ] E2E testy - optional pre neskor

### PHASE 11 (Buducnost): Web3 Extension
- [ ] Wallet connection (MetaMask/WalletConnect)
- [ ] Crypto portfolio tracking (real wallets)
- [ ] Basic DeFi data display (DefiLlama API - read only)
- [ ] Crypto price alerts
- [ ] On-chain transaction import

## Sample Client Profile (seed data)
- Meno: Dusan Oravsky
- Risk tolerance: moderate
- Time horizon: 10-15 years
- Portfolio: €847,230 (45% stocks, 25% bonds, 15% alternatives, 15% crypto)
- Holdings: AAPL, MSFT, GOOGL, VWCE, IWDA, AGG, GOVT, BTC, ETH, USDC
- Poistky: Allianz (auto), Generali (dom), Kooperativa (zdravie), UNIQA (zivot)
- Ciele: Nudzovy fond, Priplatok na byt, Dochodok, Crypto portfolio

## API Endpoints (hlavne)
- POST /api/auth/* (register, login, refresh, logout, forgot-password, reset-password)
- GET/PUT /api/user/profile, /api/user/settings
- GET /api/dashboard/overview, /stats, /performance
- CRUD /api/insurance, /api/investments, /api/transactions, /api/goals
- POST /api/ai/chat, /api/ai/insights, /api/ai/analyze-portfolio
- POST /api/import/csv, /api/import/json
- GET /api/export/template/csv, /api/export/portfolio
- GET /api/notifications
- GET /api/market/stock-price/:symbol, /api/market/crypto-price/:symbol
