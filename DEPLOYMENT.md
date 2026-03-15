# Deployment Guide - FinanceAI

Návod na nasadenie aplikácie do produkcie.

## 🚀 Rýchle nasadenie s Dockerom

### Prerequisites
- Docker & Docker Compose nainštalované
- Prístup k serveru (VPS, cloud)
- Doménové meno (voliteľné)

### 1. Príprava servera

```bash
# Update systém
sudo apt update && sudo apt upgrade -y

# Nainštaluj Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pridaj usera do docker skupiny
sudo usermod -aG docker $USER

# Nainštaluj Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone repozitára

```bash
git clone https://github.com/DusanOravsky/finance_advisor.git
cd finance_advisor
```

### 3. Konfigurácia environment variables

```bash
# Vytvor production .env
cp .env.production.example .env.production

# Edituj .env.production
nano .env.production
```

**Dôležité nastavenia:**
- `POSTGRES_PASSWORD` - silné heslo pre databázu
- `REDIS_PASSWORD` - silné heslo pre Redis
- `JWT_SECRET` - random string min 32 znakov
- `JWT_REFRESH_SECRET` - iný random string min 32 znakov
- `ANTHROPIC_API_KEY` - production Claude API key
- `FRONTEND_URL` - URL tvojej domény

**Generovanie random strings:**
```bash
openssl rand -base64 32
```

### 4. Build a spustenie

```bash
# Load env variables
export $(cat .env.production | xargs)

# Build images
docker-compose -f docker-compose.prod.yml build

# Spusti services
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Inicializácia databázy

```bash
# Spusti migrations
docker exec finance-ai-backend-prod npx prisma migrate deploy

# Seed demo data (voliteľné)
docker exec finance-ai-backend-prod npx prisma db seed
```

### 6. Overenie

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:3000/health
curl http://localhost/

# Check containers
docker ps
```

## 🌐 SSL/HTTPS Setup s Nginx

### 1. Nainštaluj Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Získaj SSL certifikát

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Cron job už je automaticky nastavený
```

## 📊 Monitoring

### Logy

```bash
# Všetky services
docker-compose -f docker-compose.prod.yml logs -f

# Iba backend
docker logs -f finance-ai-backend-prod

# Iba frontend
docker logs -f finance-ai-frontend-prod

# Database
docker logs -f finance-ai-db-prod
```

### Resource usage

```bash
docker stats
```

### Health checks

```bash
# Backend health
curl http://localhost:3000/health

# Frontend
curl http://localhost/

# Database connection
docker exec finance-ai-db-prod pg_isready -U finance_ai_user
```

## 🔄 Update aplikácie

```bash
# Pull latest changes
git pull origin master

# Rebuild a restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Migrations
docker exec finance-ai-backend-prod npx prisma migrate deploy
```

## 🔐 Security Checklist

- [ ] Silné heslá pre databázu a Redis
- [ ] JWT secrets sú random a secure (min 32 chars)
- [ ] API keys sú production keys
- [ ] HTTPS je nastavené (SSL certifikát)
- [ ] Firewall je nakonfigurovaný (port 80, 443)
- [ ] Database backups sú nastavené
- [ ] Environment variables nie sú commitnuté v gite
- [ ] Rate limiting je aktívne (už v app.ts)
- [ ] Security headers sú nastavené (helmet)

## 💾 Database Backups

### Automated backup script

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/finance_ai_$DATE.sql"

mkdir -p $BACKUP_DIR

docker exec finance-ai-db-prod pg_dump -U finance_ai_user finance_ai > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

### Cron job pre daily backups

```bash
# Edit crontab
crontab -e

# Add line (backup každý deň o 2:00)
0 2 * * * /path/to/backup-db.sh
```

### Restore z backupu

```bash
gunzip finance_ai_20240315.sql.gz
docker exec -i finance-ai-db-prod psql -U finance_ai_user finance_ai < finance_ai_20240315.sql
```

## 🌍 Cloud Deployment Options

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

### Render
1. Connect GitHub repo
2. Create Web Service (backend)
3. Create Static Site (frontend)
4. Add environment variables
5. Deploy

### DigitalOcean App Platform
1. Connect GitHub repo
2. Configure components
3. Add environment variables
4. Deploy

### AWS (EC2 + RDS)
1. Launch EC2 instance
2. Create RDS PostgreSQL database
3. Setup ElastiCache Redis
4. Configure Security Groups
5. Deploy s Docker Compose

## 🐛 Troubleshooting

### Backend nedokáže pripojiť na databázu
```bash
# Check database logs
docker logs finance-ai-db-prod

# Check network
docker network inspect finance-ai-network

# Test connection
docker exec finance-ai-backend-prod ping postgres
```

### Out of memory
```bash
# Check memory usage
docker stats

# Increase limits v docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 2G
```

### Redis connection failed
```bash
# Check Redis logs
docker logs finance-ai-redis-prod

# Test connection
docker exec finance-ai-backend-prod redis-cli -h redis -a $REDIS_PASSWORD ping
```

## 📞 Support

Pre problémy otvorte issue na GitHub:
https://github.com/DusanOravsky/finance_advisor/issues
