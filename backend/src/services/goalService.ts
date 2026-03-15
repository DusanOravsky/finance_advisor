import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GoalData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: string;
  category: string;
}

export class GoalService {
  async getGoals(userId: string) {
    return await prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
  }

  async getGoal(id: string, userId: string) {
    const goal = await prisma.financialGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new Error('Cieľ nenájdený');
    }

    return goal;
  }

  async createGoal(userId: string, data: GoalData) {
    return await prisma.financialGoal.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateGoal(id: string, userId: string, data: Partial<GoalData>) {
    await this.getGoal(id, userId);

    return await prisma.financialGoal.update({
      where: { id },
      data,
    });
  }

  async deleteGoal(id: string, userId: string) {
    await this.getGoal(id, userId);

    await prisma.financialGoal.delete({
      where: { id },
    });
  }

  async getGoalsWithProgress(userId: string) {
    const goals = await this.getGoals(userId);

    return goals.map(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      const daysRemaining = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...goal,
        progress: Math.min(progress, 100),
        remaining,
        daysRemaining,
        isOverdue: daysRemaining < 0,
      };
    });
  }
}
