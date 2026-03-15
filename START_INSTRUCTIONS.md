# Ako spustiť FinanceAI lokálne

## Rychlý štart (s Dockerom)

### 1. Spusti databázu
```bash
docker compose up -d
```

### 2. Backend setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

### 4. Spusti backend (terminál 1)
```bash
cd backend
npm run dev
```

### 5. Spusti frontend (terminál 2)
```bash
cd frontend
npm run dev
```

### 6. Otvor browser
```
http://localhost:5173
```

### 7. Prihlás sa
- Email: dusan.oravsky@gmail.com
- Heslo: password123

---

## Bez Dockeru (lokálne PostgreSQL)

### 1. Nainštaluj PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql
```

### 2. Vytvor databázu
```bash
sudo -u postgres psql
CREATE DATABASE finance_ai;
CREATE USER finance_ai_user WITH PASSWORD 'finance_ai_pass';
GRANT ALL PRIVILEGES ON DATABASE finance_ai TO finance_ai_user;
\q
```

### 3. Edituj backend/.env
```env
DATABASE_URL="postgresql://finance_ai_user:finance_ai_pass@localhost:5432/finance_ai"
REDIS_URL="redis://localhost:6379"
```

Poznámka: Redis je optional - app funguje aj bez neho (cache nebude fungovať)

### 4. Pokračuj od kroku 2 vyššie

---

## Riešenie problémov

### Port už používaný
```bash
# Backend (port 3000)
lsof -ti:3000 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Database connection error
```bash
# Check if database is running
docker ps | grep postgres

# Check logs
docker logs finance-ai-db
```

### npm install fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors
```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset
npx prisma db seed
```

---

## Užitočné príkazy

### Prisma Studio (GUI pre databázu)
```bash
cd backend
npx prisma studio
# Otvorí sa na http://localhost:5555
```

### Check backend health
```bash
curl http://localhost:3000/health
```

### View logs
```bash
# Docker logs
docker compose logs -f

# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev
```

### Zastaviť všetko
```bash
# Zastaviť Docker services
docker compose down

# Zastaviť Node processes
Ctrl+C v každom termináli
```

---

## Čo by si mal vidieť

### Backend (http://localhost:3000/health)
```json
{
  "status": "ok",
  "timestamp": "2024-03-15T12:00:00.000Z"
}
```

### Frontend (http://localhost:5173)
- Login screen
- Po prihlásení: Dashboard s portfóliom €847,230

### Demo účet obsahuje:
- 10 investícií (AAPL, MSFT, GOOGL, VWCE, IWDA, AGG, GOVT, BTC, ETH, USDC)
- Transakcie
- Finančné ciele
- Poistky
- Kompletný profil

---

## Nastavenia (voliteľné)

### Claude API key (pre AI chat)
```bash
cd backend
nano .env
```
Pridaj:
```
ANTHROPIC_API_KEY=sk-ant-api03-tvoj-key
```

### Alpha Vantage (pre stock prices)
```bash
ALPHA_VANTAGE_API_KEY=tvoj-key
```

### CoinGecko (pre crypto prices)
```bash
COINGECKO_API_KEY=tvoj-key  # voliteľné, free tier funguje bez key
```

Bez týchto API keys aplikácia funguje, ale:
- AI chat nebude fungovať (potrebuje ANTHROPIC_API_KEY)
- Real-time ceny nebudú aktualizované (ale demo data majú fixed ceny)
