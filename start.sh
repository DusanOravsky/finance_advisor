#!/bin/bash

echo "🚀 Starting FinanceAI..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Start PostgreSQL and Redis
echo "📦 Starting database services..."
docker compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 5

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Setup backend .env if not exists
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating backend .env..."
    cp backend/.env.example backend/.env
fi

# Setup frontend .env if not exists
if [ ! -f "frontend/.env" ]; then
    echo "⚙️  Creating frontend .env..."
    cp frontend/.env.example frontend/.env
fi

# Generate Prisma Client and run migrations
echo "🔧 Setting up database..."
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 Now start the development servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "🌐 Then open: http://localhost:5173"
echo "📧 Demo login: dusan.oravsky@gmail.com"
echo "🔑 Password: password123"
