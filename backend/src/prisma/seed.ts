import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed databázy...');

  // Vymaž existujúce dáta
  await prisma.chatMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.cryptoWallet.deleteMany();
  await prisma.financialGoal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  // Vytvor demo používateľa - Dušan Oravský
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.create({
    data: {
      email: 'dusan.oravsky@gmail.com',
      password: hashedPassword,
      name: 'Dušan Oravský',
      currency: 'EUR',
      riskTolerance: 'moderate',
      timeHorizon: '10-15 years',
      monthlyIncome: 3800,
      monthlyExpenses: 2650,
      savingsGoal: 50000,
      settings: {
        create: {
          notifyInsuranceRenewal: true,
          notifyInvestmentAlerts: true,
          notifyBudgetAlerts: false,
          notifyMonthlyReports: true,
          notifyCryptoAlerts: true,
          theme: 'light',
          language: 'sk',
        },
      },
    },
  });

  console.log('✅ Používateľ vytvorený:', user.email);

  // Vytvor investície (portfólio)
  const investments = [
    // Akcie
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', shares: 100, purchasePrice: 150, currentPrice: 175, platform: 'Interactive Brokers' },
    { symbol: 'MSFT', name: 'Microsoft', type: 'stock', shares: 80, purchasePrice: 280, currentPrice: 350, platform: 'Interactive Brokers' },
    { symbol: 'GOOGL', name: 'Alphabet', type: 'stock', shares: 60, purchasePrice: 120, currentPrice: 140, platform: 'Interactive Brokers' },

    // ETF
    { symbol: 'VWCE', name: 'Vanguard FTSE All-World', type: 'etf', shares: 950, purchasePrice: 90, currentPrice: 100, platform: 'Trading212' },
    { symbol: 'IWDA', name: 'iShares Core MSCI World', type: 'etf', shares: 1000, purchasePrice: 70, currentPrice: 75, platform: 'Trading212' },

    // Dlhopisy
    { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', type: 'bond', shares: 1200, purchasePrice: 95, currentPrice: 100, platform: 'Interactive Brokers' },
    { symbol: 'GOVT', name: 'iShares US Treasury Bond', type: 'bond', shares: 920, purchasePrice: 95, currentPrice: 100, platform: 'Interactive Brokers' },

    // Crypto
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', shares: 1.5, purchasePrice: 50000, currentPrice: 56666, platform: 'Binance' },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto', shares: 15, purchasePrice: 2800, currentPrice: 3000, platform: 'Binance' },
    { symbol: 'USDC', name: 'USD Coin', type: 'crypto', shares: 25230, purchasePrice: 1, currentPrice: 1, platform: 'Binance' },
  ];

  for (const inv of investments) {
    await prisma.investment.create({
      data: {
        userId: user.id,
        ...inv,
      },
    });
  }

  console.log(`✅ ${investments.length} investícií vytvorených`);

  // Vytvor transakcie
  const now = new Date();
  const transactions = [
    { date: new Date(now.getFullYear(), now.getMonth(), 1), description: 'Plat', amount: 3800, type: 'income', category: 'Mzda' },
    { date: new Date(now.getFullYear(), now.getMonth(), 5), description: 'Nájom', amount: -850, type: 'expense', category: 'Bývanie' },
    { date: new Date(now.getFullYear(), now.getMonth(), 7), description: 'Potraviny Kaufland', amount: -120, type: 'expense', category: 'Potraviny' },
    { date: new Date(now.getFullYear(), now.getMonth(), 10), description: 'Tankovanie', amount: -65, type: 'expense', category: 'Doprava' },
    { date: new Date(now.getFullYear(), now.getMonth(), 12), description: 'Internet a mobil', amount: -45, type: 'expense', category: 'Komunikácia' },
    { date: new Date(now.getFullYear(), now.getMonth(), 15), description: 'Reštaurácia', amount: -48, type: 'expense', category: 'Jedlo vonku' },
    { date: new Date(now.getFullYear(), now.getMonth(), 20), description: 'Elektrina', amount: -85, type: 'expense', category: 'Energie' },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        ...tx,
      },
    });
  }

  console.log(`✅ ${transactions.length} transakcií vytvorených`);

  // Vytvor finančné ciele
  const goals = [
    {
      name: 'Núdzový fond',
      targetAmount: 10000,
      currentAmount: 8500,
      deadline: new Date('2025-06-30'),
      priority: 'high',
      category: 'emergency',
    },
    {
      name: 'Príplatok na byt',
      targetAmount: 30000,
      currentAmount: 18600,
      deadline: new Date('2026-12-31'),
      priority: 'high',
      category: 'home',
    },
    {
      name: 'Dôchodok',
      targetAmount: 150000,
      currentAmount: 51000,
      deadline: new Date('2045-12-31'),
      priority: 'medium',
      category: 'retirement',
    },
    {
      name: 'Crypto portfólio',
      targetAmount: 200000,
      currentAmount: 155230,
      deadline: new Date('2030-12-31'),
      priority: 'medium',
      category: 'crypto',
    },
  ];

  for (const goal of goals) {
    await prisma.financialGoal.create({
      data: {
        userId: user.id,
        ...goal,
      },
    });
  }

  console.log(`✅ ${goals.length} cieľov vytvorených`);

  // Vytvor poistky
  const insurances = [
    {
      type: 'car',
      provider: 'Allianz Slovensko',
      premium: 450,
      startDate: new Date('2024-04-15'),
      endDate: new Date('2026-04-15'),
      renewalDate: new Date('2026-04-15'),
      reminderDays: 30,
      emailReminder: true,
      status: 'active',
      coverage: 'Havarijné + PZP (škoda až €50,000, spoluúčasť €200)',
      policyNumber: 'ALZ-SK-2024-00123',
      documents: [],
    },
    {
      type: 'home',
      provider: 'Generali Slovensko',
      premium: 280,
      startDate: new Date('2024-09-22'),
      endDate: new Date('2026-09-22'),
      renewalDate: new Date('2026-09-22'),
      reminderDays: 60,
      emailReminder: true,
      status: 'active',
      coverage: 'Domácnosť + majetok (krytie až €80,000, živelné pohromy)',
      policyNumber: 'GEN-SK-2024-00456',
      documents: [],
    },
    {
      type: 'health',
      provider: 'Kooperativa',
      premium: 120,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2026-12-01'),
      renewalDate: new Date('2026-12-01'),
      reminderDays: 45,
      emailReminder: true,
      status: 'active',
      coverage: 'Nadštandardné zdravotné (VIP starostlivosť, nadštandardná izba, voľba lekára)',
      policyNumber: 'KOP-SK-2024-00789',
      documents: [],
    },
    {
      type: 'life',
      provider: 'UNIQA',
      premium: 85,
      startDate: new Date('2025-01-15'),
      endDate: null,
      renewalDate: new Date('2027-01-15'),
      reminderDays: 90,
      emailReminder: true,
      status: 'active',
      coverage: 'Životné poistenie (€100,000 v prípade úmrtia, invalidita, úraz)',
      policyNumber: 'UNI-SK-2024-01011',
      documents: [],
    },
  ];

  for (const insurance of insurances) {
    await prisma.insurance.create({
      data: {
        userId: user.id,
        ...insurance,
      },
    });
  }

  console.log(`✅ ${insurances.length} poistiek vytvorených`);

  // Vytvor crypto wallet
  await prisma.cryptoWallet.create({
    data: {
      userId: user.id,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      chainId: 1,
      provider: 'MetaMask',
      connected: true,
      ethBalance: 2.45,
    },
  });

  console.log('✅ Crypto wallet vytvorený');

  console.log('\n🎉 Seed dokončený!');
  console.log('\n📝 Demo prihlasovacie údaje:');
  console.log('Email: dusan.oravsky@gmail.com');
  console.log('Heslo: password123');
}

main()
  .catch(e => {
    console.error('❌ Chyba pri seedovaní:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
