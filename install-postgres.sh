#!/bin/bash
# Install PostgreSQL on WSL2 for FinanceAI

echo "🚀 Installing PostgreSQL..."

# Update packages
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
sudo service postgresql start

# Create database and user
echo "📦 Creating database..."
sudo -u postgres psql <<EOF
CREATE DATABASE finance_ai;
CREATE USER finance_ai_user WITH PASSWORD 'finance_ai_pass';
GRANT ALL PRIVILEGES ON DATABASE finance_ai TO finance_ai_user;
ALTER DATABASE finance_ai OWNER TO finance_ai_user;
\q
EOF

echo "✅ PostgreSQL installed and configured!"
echo ""
echo "📝 Database credentials:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: finance_ai"
echo "   User: finance_ai_user"
echo "   Password: finance_ai_pass"
echo ""
echo "🔗 Connection string:"
echo "   postgresql://finance_ai_user:finance_ai_pass@localhost:5432/finance_ai"
