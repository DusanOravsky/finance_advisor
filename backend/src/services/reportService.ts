import { PrismaClient } from '@prisma/client';
import { PortfolioService } from './portfolioService';
import { TransactionService } from './transactionService';

const prisma = new PrismaClient();
const portfolioService = new PortfolioService();
const transactionService = new TransactionService();

export class ReportService {
  // Mesačný report
  async generateMonthlyReport(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [transactions, portfolio, goals] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'desc' },
      }),
      portfolioService.getPortfolioSummary(userId),
      prisma.financialGoal.findMany({ where: { userId } }),
    ]);

    // Agregácia transakcií
    const summary = transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') {
          acc.totalIncome += tx.amount;
        } else if (tx.type === 'expense') {
          acc.totalExpenses += tx.amount;
        }

        // Kategórie
        if (!acc.byCategory[tx.category]) {
          acc.byCategory[tx.category] = 0;
        }
        acc.byCategory[tx.category] += Math.abs(tx.amount);

        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        byCategory: {} as Record<string, number>,
      }
    );

    return {
      period: {
        year,
        month,
        startDate,
        endDate,
      },
      transactions: {
        total: transactions.length,
        income: summary.totalIncome,
        expenses: summary.totalExpenses,
        netCashflow: summary.totalIncome - summary.totalExpenses,
        savingsRate:
          summary.totalIncome > 0
            ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
            : 0,
        byCategory: summary.byCategory,
      },
      portfolio: {
        totalValue: portfolio.totalValue,
        totalProfit: portfolio.totalProfit,
        totalProfitPercentage: portfolio.totalProfitPercentage,
        allocation: portfolio.allocation,
      },
      goals: {
        total: goals.length,
        completed: goals.filter(g => (g.currentAmount / g.targetAmount) * 100 >= 100).length,
        inProgress: goals.filter(
          g => (g.currentAmount / g.targetAmount) * 100 < 100 && new Date(g.deadline) > new Date()
        ).length,
      },
      generatedAt: new Date(),
    };
  }

  // Quarterly report
  async generateQuarterlyReport(userId: string, year: number, quarter: number) {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;

    const monthlyReports = await Promise.all([
      this.generateMonthlyReport(userId, year, startMonth),
      this.generateMonthlyReport(userId, year, startMonth + 1),
      this.generateMonthlyReport(userId, year, endMonth),
    ]);

    // Agregácia za kvartál
    const quarterSummary = monthlyReports.reduce(
      (acc, report) => {
        acc.totalIncome += report.transactions.income;
        acc.totalExpenses += report.transactions.expenses;
        acc.totalTransactions += report.transactions.total;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, totalTransactions: 0 }
    );

    return {
      period: {
        year,
        quarter,
        startDate: monthlyReports[0].period.startDate,
        endDate: monthlyReports[2].period.endDate,
      },
      summary: {
        ...quarterSummary,
        netCashflow: quarterSummary.totalIncome - quarterSummary.totalExpenses,
        savingsRate:
          quarterSummary.totalIncome > 0
            ? ((quarterSummary.totalIncome - quarterSummary.totalExpenses) /
                quarterSummary.totalIncome) *
              100
            : 0,
      },
      monthlyReports,
      generatedAt: new Date(),
    };
  }

  // Yearly report
  async generateYearlyReport(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [transactions, portfolio, goals, insurances] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
      }),
      portfolioService.getPortfolioSummary(userId),
      prisma.financialGoal.findMany({ where: { userId } }),
      prisma.insurance.findMany({ where: { userId } }),
    ]);

    const summary = transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.totalIncome += tx.amount;
        if (tx.type === 'expense') acc.totalExpenses += tx.amount;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    return {
      period: { year, startDate, endDate },
      summary: {
        ...summary,
        netCashflow: summary.totalIncome - summary.totalExpenses,
        totalTransactions: transactions.length,
      },
      portfolio: {
        totalValue: portfolio.totalValue,
        totalProfit: portfolio.totalProfit,
        holdingsCount: portfolio.holdings.length,
      },
      goals: {
        total: goals.length,
        completed: goals.filter(g => (g.currentAmount / g.targetAmount) * 100 >= 100).length,
      },
      insurances: {
        total: insurances.length,
        totalPremium: insurances.reduce((sum, ins) => sum + ins.premium, 0),
      },
      generatedAt: new Date(),
    };
  }

  // Tax report (základný)
  async generateTaxReport(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [incomeTransactions, investments] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'income',
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.investment.findMany({ where: { userId } }),
    ]);

    const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Kapitálové zisky z investícií
    const capitalGains = investments.reduce((sum, inv) => {
      const gain = (inv.currentPrice - inv.purchasePrice) * inv.shares;
      return sum + (gain > 0 ? gain : 0);
    }, 0);

    return {
      year,
      income: {
        totalIncome,
        taxableIncome: totalIncome, // zjednodušené
      },
      investments: {
        capitalGains,
        taxableGains: capitalGains * 0.19, // 19% daň na Slovensku
      },
      estimatedTax: totalIncome * 0.19 + capitalGains * 0.19, // zjednodušený výpočet
      generatedAt: new Date(),
    };
  }
}
