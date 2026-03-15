import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationData {
  type: string;
  title: string;
  message: string;
  urgent?: boolean;
  actionUrl?: string;
}

export class NotificationService {
  async getNotifications(userId: string, limit = 50) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async createNotification(userId: string, data: NotificationData) {
    return await prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notifikácia nenájdená');
    }

    return await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notifikácia nenájdená');
    }

    await prisma.notification.delete({
      where: { id },
    });
  }

  // Generovanie notifikácií pre insurance renewals
  async generateInsuranceRenewalNotifications(userId: string) {
    const insurances = await prisma.insurance.findMany({
      where: {
        userId,
        status: 'active',
      },
    });

    const notifications = [];
    const now = new Date();

    for (const insurance of insurances) {
      const daysUntilRenewal = Math.ceil(
        (new Date(insurance.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Notifikácie na 90, 60, 30 dní
      if ([90, 60, 30].includes(daysUntilRenewal)) {
        // Skontroluj či už neexistuje notifikácia
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'insurance',
            message: { contains: insurance.id },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // posledných 24h
          },
        });

        if (!existing) {
          const notification = await this.createNotification(userId, {
            type: 'insurance',
            title: `Obnovenie poistky - ${daysUntilRenewal} dní`,
            message: `Vaša poistka ${insurance.type} u ${insurance.provider} sa obnovuje o ${daysUntilRenewal} dní.`,
            urgent: daysUntilRenewal <= 30,
            actionUrl: '/insurance',
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  }

  // Generovanie notifikácií pre goals
  async generateGoalNotifications(userId: string) {
    const goals = await prisma.financialGoal.findMany({
      where: { userId },
    });

    const notifications = [];

    for (const goal of goals) {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysRemaining = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Notifikácia pri dosiahnutí cieľa
      if (progress >= 100) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'goal',
            message: { contains: goal.id },
          },
        });

        if (!existing) {
          const notification = await this.createNotification(userId, {
            type: 'goal',
            title: '🎉 Cieľ splnený!',
            message: `Gratulujeme! Dosiahli ste finančný cieľ: ${goal.name}`,
            actionUrl: '/dashboard',
          });
          notifications.push(notification);
        }
      }

      // Notifikácia pri blížiacom sa deadlinu
      if (daysRemaining <= 30 && progress < 100) {
        const existing = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'goal',
            message: { contains: `${goal.id}-deadline` },
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // posledných 7 dní
          },
        });

        if (!existing) {
          const notification = await this.createNotification(userId, {
            type: 'goal',
            title: 'Blíži sa deadline cieľa',
            message: `Cieľ "${goal.name}" má deadline o ${daysRemaining} dní. Aktuálny progress: ${progress.toFixed(0)}%`,
            urgent: daysRemaining <= 7,
            actionUrl: '/dashboard',
          });
          notifications.push(notification);
        }
      }
    }

    return notifications;
  }
}
