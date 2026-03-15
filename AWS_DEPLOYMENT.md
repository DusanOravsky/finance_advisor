# AWS Deployment Guide - FinanceAI

## 🚀 Option 1: AWS Lightsail (Najjednoduchšie)

**Cena:** $5-10/mesiac
**Vhodné pre:** Small-medium traffic, prototyping, production ready

### Setup (15 minút)

#### 1. Vytvor Lightsail instanciu

```bash
# V AWS Console > Lightsail > Create instance
- Platform: Linux/Unix
- Blueprint: OS Only > Ubuntu 22.04 LTS
- Plan: $5/month (1 GB RAM, 1 vCPU, 40 GB SSD)
- Instance name: finance-ai
```

#### 2. Pripojiť sa cez SSH

```bash
# Download SSH key z Lightsail console
chmod 400 LightsailDefaultKey.pem
ssh -i LightsailDefaultKey.pem ubuntu@your-instance-ip
```

#### 3. Setup server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (pre backend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install git -y
```

#### 4. Clone a deploy

```bash
# Clone repo
git clone https://github.com/DusanOravsky/finance_advisor.git
cd finance_advisor

# Setup production .env
cp .env.production.example .env.production
nano .env.production  # Edituj production variables

# Load env vars
export $(cat .env.production | xargs)

# Build a deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec finance-ai-backend-prod npx prisma migrate deploy
docker exec finance-ai-backend-prod npx prisma db seed
```

#### 5. Configure firewall

```bash
# V Lightsail Console > Networking > Firewall
- Add rule: HTTP (80)
- Add rule: HTTPS (443)
- Add rule: Custom TCP (3000) - pre backend API
```

#### 6. Setup domain (optional)

```bash
# V Lightsail Console > Networking > Create static IP
# Priradí static IP k instance
# V DNS nastaveniach (napr. Cloudflare):
# A Record: @ -> your-static-ip
# A Record: www -> your-static-ip
```

#### 7. SSL/HTTPS

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal je už nastavený
```

---

## 🏢 Option 2: AWS EC2 + RDS (Production Grade)

**Cena:** $20-50/mesiac
**Vhodné pre:** Production, high traffic, scalable

### Komponenty

1. **EC2 Instance** (t3.small) - $15/mesiac
2. **RDS PostgreSQL** (db.t3.micro) - $15/mesiac
3. **ElastiCache Redis** (cache.t3.micro) - $13/mesiac
4. **Application Load Balancer** - $16/mesiac
5. **S3** pre static assets - $1-5/mesiac

### Setup

#### 1. RDS PostgreSQL Database

```bash
# AWS Console > RDS > Create database
- Engine: PostgreSQL 15
- Template: Free tier / Production
- DB instance: db.t3.micro
- Storage: 20 GB SSD
- VPC: Default VPC
- Public access: No
- Security group: Create new (allow 5432 from EC2 security group)
- Database name: finance_ai
```

**Connection string:**
```
postgresql://admin:password@finance-ai-db.xxx.region.rds.amazonaws.com:5432/finance_ai
```

#### 2. ElastiCache Redis

```bash
# AWS Console > ElastiCache > Create cluster
- Engine: Redis
- Node type: cache.t3.micro
- Number of nodes: 1
- VPC: Same as RDS
- Security group: Allow 6379 from EC2
```

**Connection string:**
```
redis://finance-ai-cache.xxx.region.cache.amazonaws.com:6379
```

#### 3. EC2 Instance

```bash
# AWS Console > EC2 > Launch instance
- AMI: Ubuntu 22.04 LTS
- Instance type: t3.small (2 vCPU, 2 GB RAM)
- Key pair: Create new or use existing
- Security group:
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere
  - Custom (3000) from anywhere
- Storage: 30 GB gp3
```

#### 4. Deploy na EC2

```bash
# SSH do EC2
ssh -i your-key.pem ubuntu@ec2-public-ip

# Install Docker (ako v Option 1)
# Clone repo
git clone https://github.com/DusanOravsky/finance_advisor.git
cd finance_advisor

# Setup .env.production
cat > .env.production << EOF
DATABASE_URL="postgresql://admin:password@rds-endpoint:5432/finance_ai"
REDIS_URL="redis://elasticache-endpoint:6379"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
ANTHROPIC_API_KEY="your-key"
FRONTEND_URL="https://your-domain.com"
NODE_ENV="production"
EOF

# Deploy
export $(cat .env.production | xargs)
docker-compose -f docker-compose.prod.yml up -d

# Migrations
docker exec finance-ai-backend-prod npx prisma migrate deploy
```

#### 5. Application Load Balancer (optional)

```bash
# AWS Console > EC2 > Load Balancers > Create
- Type: Application Load Balancer
- Scheme: Internet-facing
- Listeners: HTTP (80), HTTPS (443)
- Target group: EC2 instance on port 80
- Health check: /health
```

---

## ☁️ Option 3: AWS Amplify (Frontend) + Lambda (Backend)

**Cena:** Pay-as-you-go (může být velmi lacné)
**Vhodné pre:** Serverless, auto-scaling

### Frontend na Amplify

```bash
# AWS Console > Amplify > New app > Connect to GitHub
- Select: finance_advisor repository
- Branch: master
- Build settings:
  - Build command: cd frontend && npm run build
  - Output directory: frontend/dist
- Deploy

# Domain setup v Amplify Console
```

### Backend na Lambda + API Gateway

Toto vyžaduje refactoring - Express -> Lambda handlers.

**Pre jednoduchosť odporúčam Option 1 alebo 2.**

---

## 🎯 Option 4: AWS Elastic Beanstalk (Managed)

**Cena:** $20-40/mesiac
**Vhodné pre:** Managed solution, auto-scaling

```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd finance_advisor
eb init -p docker finance-ai --region eu-central-1

# Create environment
eb create finance-ai-prod --database.engine postgres --database.size 20

# Deploy
eb deploy

# Open app
eb open
```

---

## 💰 Cost Comparison

| Option | Monthly Cost | Setup Time | Scalability | Difficulty |
|--------|-------------|------------|-------------|-----------|
| **Lightsail** | $5-10 | 15 min | Low | ⭐ Easy |
| **EC2+RDS** | $20-50 | 1 hour | High | ⭐⭐⭐ Medium |
| **Amplify+Lambda** | $5-20 | 2 hours | Very High | ⭐⭐⭐⭐ Hard |
| **Elastic Beanstalk** | $20-40 | 30 min | High | ⭐⭐ Easy-Medium |

---

## ✅ Odporúčanie

### Pre začiatok: **AWS Lightsail**
- Najjednoduchšie
- Fixed price
- Všetko v jednom
- Rýchle na setup

### Pre production s traffic: **EC2 + RDS**
- Managed database (zálohy, scaling)
- Oddelené services
- Lepšia performance
- Professional setup

---

## 🔒 Security Checklist

- [ ] SSH key pair uložený bezpečne
- [ ] Security groups správne nastavené
- [ ] SSL certifikát (Let's Encrypt)
- [ ] Database v private subnet
- [ ] Strong passwords v .env.production
- [ ] Firewall rules (len potrebné porty)
- [ ] Regular backups enabled
- [ ] CloudWatch monitoring setup
- [ ] IAM roles namiesto root credentials

---

## 📊 Monitoring

### CloudWatch Logs

```bash
# Install CloudWatch agent na EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### Custom Metrics

```bash
# Backend metrics
docker stats --no-stream

# Database connections
aws rds describe-db-instances --db-instance-identifier finance-ai-db

# Redis stats
redis-cli info stats
```

---

## 🔄 CI/CD s AWS

### Deploy cez GitHub Actions

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-central-1

      - name: Deploy to EC2
        run: |
          ssh -i ${{ secrets.SSH_KEY }} ubuntu@${{ secrets.EC2_IP }} << 'EOF'
            cd finance_advisor
            git pull origin master
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            docker exec finance-ai-backend-prod npx prisma migrate deploy
          EOF
```

---

## 🆘 Troubleshooting

### Cannot connect to database
```bash
# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxx

# Test connection
telnet rds-endpoint 5432
```

### Out of memory
```bash
# Check memory
free -h

# Upgrade instance
# Lightsail: Snapshot > Create larger instance
# EC2: Stop > Change instance type > Start
```

### SSL issues
```bash
# Renew certificate
sudo certbot renew --dry-run

# Check certificate
sudo certbot certificates
```

---

## 📞 Support

AWS Documentation: https://docs.aws.amazon.com/
AWS Free Tier: https://aws.amazon.com/free/

Pre otázky otvor issue na GitHub:
https://github.com/DusanOravsky/finance_advisor/issues
