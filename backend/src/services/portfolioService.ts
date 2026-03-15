import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InvestmentData {
  symbol: string;
  name: string;
  type: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  platform?: string;
}

export class PortfolioService {
  async getInvestments(userId: string) {
    return await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvestment(id: string, userId: string) {
    const investment = await prisma.investment.findFirst({
      where: { id, userId },
    });

    if (!investment) {
      throw new Error('Investícia nenájdená');
    }

    return investment;
  }

  async createInvestment(userId: string, data: InvestmentData) {
    return await prisma.investment.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateInvestment(id: string, userId: string, data: Partial<InvestmentData>) {
    // Overenie vlastníctva
    await this.getInvestment(id, userId);

    return await prisma.investment.update({
      where: { id },
      data,
    });
  }

  async deleteInvestment(id: string, userId: string) {
    // Overenie vlastníctva
    await this.getInvestment(id, userId);

    await prisma.investment.delete({
      where: { id },
    });
  }

  async getPortfolioSummary(userId: string) {
    const investments = await this.getInvestments(userId);

    // Agregácia podľa typu
    const summary = investments.reduce(
      (acc, inv) => {
        const value = inv.shares * inv.currentPrice;
        acc.totalValue += value;

        if (!acc.byType[inv.type]) {
          acc.byType[inv.type] = 0;
        }
        acc.byType[inv.type] += value;

        // Performance calculation
        const costBasis = inv.shares * inv.purchasePrice;
        const profit = value - costBasis;
        const profitPercentage = (profit / costBasis) * 100;

        acc.totalProfit += profit;
        acc.items.push({
          id: inv.id,
          symbol: inv.symbol,
          name: inv.name,
          type: inv.type,
          shares: inv.shares,
          currentPrice: inv.currentPrice,
          value,
          profitPercentage,
        });

        return acc;
      },
      {
        totalValue: 0,
        totalProfit: 0,
        byType: {} as Record<string, number>,
        items: [] as any[],
      }
    );

    // Percentuálne rozdelenie podľa typu
    const allocation = Object.entries(summary.byType).map(([type, value]) => ({
      type,
      value,
      percentage: (value / summary.totalValue) * 100,
    }));

    return {
      totalValue: summary.totalValue,
      totalProfit: summary.totalProfit,
      totalProfitPercentage: (summary.totalProfit / (summary.totalValue - summary.totalProfit)) * 100,
      allocation,
      holdings: summary.items,
    };
  }
}
