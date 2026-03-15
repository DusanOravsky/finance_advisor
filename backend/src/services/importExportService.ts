import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

export class ImportExportService {
  // Parse CSV holdings
  parseCSV(csvContent: string): any[] {
    try {
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      return records.map((record: any) => ({
        symbol: record.Symbol || record.symbol,
        name: record.Name || record.name,
        type: record.Type || record.type || 'stock',
        shares: parseFloat(record.Shares || record.shares || '0'),
        purchasePrice: parseFloat(record.PurchasePrice || record.purchasePrice || '0'),
        currentPrice: parseFloat(record.CurrentPrice || record.currentPrice || '0'),
        platform: record.Platform || record.platform || '',
      }));
    } catch (error: any) {
      throw new Error(`CSV parsing error: ${error.message}`);
    }
  }

  // Import holdings z CSV
  async importHoldingsFromCSV(userId: string, csvContent: string) {
    const holdings = this.parseCSV(csvContent);

    const imported = [];
    for (const holding of holdings) {
      try {
        const investment = await prisma.investment.create({
          data: {
            userId,
            ...holding,
          },
        });
        imported.push(investment);
      } catch (error) {
        console.error(`Error importing ${holding.symbol}:`, error);
      }
    }

    return {
      imported: imported.length,
      total: holdings.length,
      items: imported,
    };
  }

  // Import z JSON (full profile)
  async importClientProfile(userId: string, profileData: any) {
    const imported: any = {
      investments: 0,
      transactions: 0,
      goals: 0,
      insurances: 0,
    };

    try {
      // Import investments
      if (profileData.investments && Array.isArray(profileData.investments)) {
        for (const inv of profileData.investments) {
          await prisma.investment.create({
            data: { userId, ...inv },
          });
          imported.investments++;
        }
      }

      // Import transactions
      if (profileData.transactions && Array.isArray(profileData.transactions)) {
        for (const tx of profileData.transactions) {
          await prisma.transaction.create({
            data: {
              userId,
              ...tx,
              date: new Date(tx.date),
            },
          });
          imported.transactions++;
        }
      }

      // Import goals
      if (profileData.goals && Array.isArray(profileData.goals)) {
        for (const goal of profileData.goals) {
          await prisma.financialGoal.create({
            data: {
              userId,
              ...goal,
              deadline: new Date(goal.deadline),
            },
          });
          imported.goals++;
        }
      }

      // Import insurances
      if (profileData.insurances && Array.isArray(profileData.insurances)) {
        for (const ins of profileData.insurances) {
          await prisma.insurance.create({
            data: {
              userId,
              ...ins,
              renewalDate: new Date(ins.renewalDate),
            },
          });
          imported.insurances++;
        }
      }

      return imported;
    } catch (error: any) {
      throw new Error(`JSON import error: ${error.message}`);
    }
  }

  // Export portfolio do CSV
  async exportPortfolioToCSV(userId: string): Promise<string> {
    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { symbol: 'asc' },
    });

    // CSV header
    let csv = 'Symbol,Name,Type,Shares,PurchasePrice,CurrentPrice,Platform\n';

    // CSV rows
    investments.forEach(inv => {
      csv += `${inv.symbol},${inv.name},${inv.type},${inv.shares},${inv.purchasePrice},${inv.currentPrice},${inv.platform || ''}\n`;
    });

    return csv;
  }

  // Export full profile do JSON
  async exportClientProfile(userId: string) {
    const [user, investments, transactions, goals, insurances] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          currency: true,
          riskTolerance: true,
          timeHorizon: true,
          monthlyIncome: true,
          monthlyExpenses: true,
          savingsGoal: true,
        },
      }),
      prisma.investment.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId }, take: 100 }),
      prisma.financialGoal.findMany({ where: { userId } }),
      prisma.insurance.findMany({ where: { userId } }),
    ]);

    return {
      exportDate: new Date().toISOString(),
      user,
      investments,
      transactions,
      goals,
      insurances,
    };
  }

  // Generate sample CSV template
  getSampleCSV(): string {
    return `Symbol,Name,Type,Shares,PurchasePrice,CurrentPrice,Platform
AAPL,Apple Inc.,stock,100,150.00,175.00,Interactive Brokers
MSFT,Microsoft,stock,50,280.00,350.00,Interactive Brokers
VWCE,Vanguard FTSE All-World,etf,200,90.00,100.00,Trading212
BTC,Bitcoin,crypto,0.5,50000.00,56666.00,Binance`;
  }

  // Generate sample JSON template
  getSampleJSON() {
    return {
      investments: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'stock',
          shares: 100,
          purchasePrice: 150,
          currentPrice: 175,
          platform: 'Interactive Brokers',
        },
      ],
      transactions: [
        {
          date: '2024-01-01',
          description: 'Plat',
          amount: 3000,
          type: 'income',
          category: 'Mzda',
        },
      ],
      goals: [
        {
          name: 'Núdzový fond',
          targetAmount: 10000,
          currentAmount: 5000,
          deadline: '2025-12-31',
          priority: 'high',
          category: 'emergency',
        },
      ],
      insurances: [
        {
          type: 'car',
          provider: 'Allianz Slovensko',
          premium: 450,
          renewalDate: '2025-04-15',
          status: 'active',
          coverage: 'Havarijné + PZP',
          policyNumber: 'ALZ-001',
        },
      ],
    };
  }
}
