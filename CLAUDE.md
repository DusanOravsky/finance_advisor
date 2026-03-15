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

### PHASE 5: Market Data & Real Prices (Tyzden 7)
- [ ] CoinGecko integracia (crypto ceny - free API)
- [ ] Alpha Vantage integracia (stock ceny)
- [ ] Caching layer (Redis) pre API calls
- [ ] Background price update job (Bull queue)
- [ ] Frontend: Live ceny v portfoliu
- [ ] Frontend: Performance charts

### PHASE 6: Insurance Management (Tyzden 8)
- [ ] Insurance model + full CRUD API
- [ ] Renewal notification logic (30/60/90 dni)
- [ ] Insurance comparison (simulated data pre SK poistovne)
- [ ] Document upload (Multer)
- [ ] Frontend: Insurance list, cards, forms
- [ ] Frontend: Renewal alerts
- [ ] Frontend: Comparison view

### PHASE 7: Data Import/Export (Tyzden 9)
- [ ] CSV parser (portfolio holdings)
- [ ] JSON parser (client profiles)
- [ ] File upload + validation
- [ ] Export templates (sample CSV/JSON)
- [ ] PDF report generation (basic)
- [ ] Frontend: Import/Export UI v Settings

### PHASE 8: Notifications & Reports (Tyzden 10)
- [ ] Notification model + API
- [ ] In-app notification system
- [ ] Email notifications (Nodemailer) - optional
- [ ] Monthly report generation
- [ ] Frontend: Notification bell + dropdown
- [ ] Frontend: Reports page s charts
- [ ] Frontend: Export buttons (PDF/Excel)

### PHASE 9: Polish & Settings (Tyzden 11)
- [ ] Settings page (profile, notifications, theme)
- [ ] Dark/light mode
- [ ] Slovak/English language support
- [ ] Error handling & loading states
- [ ] Responsive design (mobile)
- [ ] Swagger/OpenAPI dokumentacia

### PHASE 10: Testing & Deployment (Tyzden 12)
- [ ] Unit testy (backend services)
- [ ] API integration testy
- [ ] Frontend component testy
- [ ] E2E testy (Playwright) - critical paths
- [ ] Docker production builds
- [ ] GitHub Actions CI/CD
- [ ] Deployment guide

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
