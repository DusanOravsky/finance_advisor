import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TransactionData {
  date: Date;
  description: string;
  amount: number;
  type: string;
  category: string;
  accountId?: string;
}

export class TransactionService {
  async getTransactions(userId: string, limit = 50) {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getTransaction(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) {
      throw new Error('Transakcia nenájdená');
    }

    return transaction;
  }

  async createTransaction(userId: string, data: TransactionData) {
    return await prisma.transaction.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateTransaction(id: string, userId: string, data: Partial<TransactionData>) {
    await this.getTransaction(id, userId);

    return await prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async deleteTransaction(id: string, userId: string) {
    await this.getTransaction(id, userId);

    await prisma.transaction.delete({
      where: { id },
    });
  }

  async getCashflowSummary(userId: string, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

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
      ...summary,
      netCashflow: summary.totalIncome - summary.totalExpenses,
      savingsRate: (summary.totalIncome > 0)
        ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
        : 0,
    };
  }
}
