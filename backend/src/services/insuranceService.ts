import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface InsuranceData {
  type: string;
  provider: string;
  premium: number;
  startDate: Date;
  endDate?: Date;
  renewalDate: Date;
  reminderDays?: number;
  emailReminder?: boolean;
  status: string;
  coverage: string;
  policyNumber: string;
  documents?: string[];
}

export class InsuranceService {
  async getInsurances(userId: string) {
    return await prisma.insurance.findMany({
      where: { userId },
      orderBy: { renewalDate: 'asc' },
    });
  }

  async getInsurance(id: string, userId: string) {
    const insurance = await prisma.insurance.findFirst({
      where: { id, userId },
    });

    if (!insurance) {
      throw new Error('Poistka nenájdená');
    }

    return insurance;
  }

  async createInsurance(userId: string, data: InsuranceData) {
    return await prisma.insurance.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async updateInsurance(id: string, userId: string, data: Partial<InsuranceData>) {
    await this.getInsurance(id, userId);

    return await prisma.insurance.update({
      where: { id },
      data,
    });
  }

  async deleteInsurance(id: string, userId: string) {
    await this.getInsurance(id, userId);

    await prisma.insurance.delete({
      where: { id },
    });
  }

  // Upozornenia na obnovenie (30, 60, 90 dní)
  async getUpcomingRenewals(userId: string, days = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const insurances = await prisma.insurance.findMany({
      where: {
        userId,
        renewalDate: {
          gte: new Date(),
          lte: futureDate,
        },
        status: 'active',
      },
      orderBy: { renewalDate: 'asc' },
    });

    return insurances.map(ins => {
      const daysUntilRenewal = Math.ceil(
        (new Date(ins.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...ins,
        daysUntilRenewal,
        urgent: daysUntilRenewal <= 30,
      };
    });
  }

  // Porovnanie poisťovní (simulované dáta)
  async compareInsurance(type: string) {
    // V produkcii by to bolo API volanie na poisťovne
    const providers: Record<string, any[]> = {
      car: [
        { provider: 'Allianz Slovensko', premium: 450, coverage: 'Havarijné + PZP', rating: 4.5, discount: 0 },
        { provider: 'UNIQA', premium: 380, coverage: 'Havarijné + PZP', rating: 4.3, discount: 15 },
        { provider: 'Kooperativa', premium: 395, coverage: 'Havarijné + PZP', rating: 4.2, discount: 12 },
        { provider: 'Generali Slovensko', premium: 420, coverage: 'Havarijné + PZP', rating: 4.4, discount: 7 },
        { provider: 'AXA', premium: 465, coverage: 'Havarijné + PZP Premium', rating: 4.6, discount: 0 },
      ],
      home: [
        { provider: 'Generali Slovensko', premium: 280, coverage: 'Domácnosť + majetok', rating: 4.4, discount: 0 },
        { provider: 'Allianz Slovensko', premium: 295, coverage: 'Domácnosť + majetok', rating: 4.5, discount: 0 },
        { provider: 'Kooperativa', premium: 265, coverage: 'Domácnosť základná', rating: 4.2, discount: 5 },
        { provider: 'UNIQA', premium: 310, coverage: 'Domácnosť premium', rating: 4.3, discount: 0 },
      ],
      health: [
        { provider: 'Kooperativa', premium: 120, coverage: 'Nadštandardné zdravotné', rating: 4.1, discount: 0 },
        { provider: 'UNIQA', premium: 135, coverage: 'Nadštandardné zdravotné', rating: 4.2, discount: 0 },
        { provider: 'Generali Slovensko', premium: 110, coverage: 'Základné zdravotné', rating: 4.0, discount: 10 },
        { provider: 'Allianz Slovensko', premium: 145, coverage: 'Premium zdravotné', rating: 4.4, discount: 0 },
      ],
      life: [
        { provider: 'UNIQA', premium: 85, coverage: 'Životné poistenie', rating: 4.3, discount: 0 },
        { provider: 'Allianz Slovensko', premium: 95, coverage: 'Životné poistenie', rating: 4.5, discount: 0 },
        { provider: 'Generali Slovensko', premium: 78, coverage: 'Životné základné', rating: 4.1, discount: 8 },
        { provider: 'NN Slovensko', premium: 105, coverage: 'Životné premium', rating: 4.4, discount: 0 },
      ],
    };

    return providers[type] || [];
  }

  // Štatistiky
  async getInsuranceStats(userId: string) {
    const insurances = await this.getInsurances(userId);

    const totalPremium = insurances.reduce((sum, ins) => sum + ins.premium, 0);
    const activeCount = insurances.filter(ins => ins.status === 'active').length;
    const upcomingRenewals = await this.getUpcomingRenewals(userId, 30);

    return {
      totalPremium,
      activeCount,
      totalCount: insurances.length,
      upcomingRenewals: upcomingRenewals.length,
    };
  }
}
