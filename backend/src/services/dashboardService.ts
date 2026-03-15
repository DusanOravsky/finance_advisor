import { PrismaClient } from '@prisma/client';
import { PortfolioService } from './portfolioService';
import { TransactionService } from './transactionService';
import { GoalService } from './goalService';

const prisma = new PrismaClient();
const portfolioService = new PortfolioService();
const transactionService = new TransactionService();
const goalService = new GoalService();

export class DashboardService {
  async getOverview(userId: string) {
    // Paralelné načítanie dát
    const [user, portfolio, cashflow, goals, recentTransactions] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      portfolioService.getPortfolioSummary(userId),
      transactionService.getCashflowSummary(userId),
      goalService.getGoalsWithProgress(userId),
      transactionService.getTransactions(userId, 5),
    ]);

    if (!user) {
      throw new Error('Používateľ nenájdený');
    }

    // Celková finančná situácia
    const totalAssets = portfolio.totalValue;
    const netWorth = totalAssets; // V budúcnosti pridať záväzky

    return {
      user: {
        name: user.name,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
        monthlyExpenses: user.monthlyExpenses,
      },
      financialOverview: {
        netWorth,
        totalAssets,
        monthlyIncome: cashflow.totalIncome,
        monthlyExpenses: cashflow.totalExpenses,
        monthlySavings: cashflow.netCashflow,
        savingsRate: cashflow.savingsRate,
      },
      portfolio: {
        totalValue: portfolio.totalValue,
        totalProfit: portfolio.totalProfit,
        totalProfitPercentage: portfolio.totalProfitPercentage,
        allocation: portfolio.allocation,
        topHoldings: portfolio.holdings.slice(0, 5),
      },
      goals: {
        total: goals.length,
        completed: goals.filter(g => g.progress >= 100).length,
        urgent: goals.filter(g => g.daysRemaining < 30 && g.daysRemaining > 0).length,
        items: goals.slice(0, 3),
      },
      recentTransactions,
    };
  }

  async getStats(userId: string) {
    const [investmentCount, transactionCount, goalCount, insuranceCount] = await Promise.all([
      prisma.investment.count({ where: { userId } }),
      prisma.transaction.count({ where: { userId } }),
      prisma.financialGoal.count({ where: { userId } }),
      prisma.insurance.count({ where: { userId } }),
    ]);

    return {
      investments: investmentCount,
      transactions: transactionCount,
      goals: goalCount,
      insurances: insuranceCount,
    };
  }
}
