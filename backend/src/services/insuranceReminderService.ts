import { PrismaClient } from '@prisma/client';
import { EmailService } from './emailService';

const prisma = new PrismaClient();

export class InsuranceReminderService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Skontroluj všetky poistky a pošli pripomienky
   */
  async checkAndSendReminders(): Promise<{
    checked: number;
    sent: number;
    failed: number;
  }> {
    try {
      const now = new Date();

      // Nájdi všetky aktívne poistky s email reminderom
      const insurances = await prisma.insurance.findMany({
        where: {
          status: 'active',
          emailReminder: true,
        },
        include: {
          user: {
            select: {
              email: true,
              settings: {
                select: {
                  notifyInsuranceRenewal: true,
                },
              },
            },
          },
        },
      });

      let sent = 0;
      let failed = 0;

      for (const insurance of insurances) {
        // Skip ak user má vypnuté notifikácie
        if (!insurance.user.settings?.notifyInsuranceRenewal) {
          continue;
        }

        const daysUntilRenewal = Math.ceil(
          (new Date(insurance.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Skontroluj či je čas poslať pripomienku
        const shouldSend = this.shouldSendReminder(
          daysUntilRenewal,
          insurance.reminderDays,
          insurance.lastReminderSent
        );

        if (shouldSend) {
          const success = await this.emailService.sendInsuranceRenewalReminder(
            insurance.user.email,
            {
              type: insurance.type,
              provider: insurance.provider,
              policyNumber: insurance.policyNumber,
              renewalDate: insurance.renewalDate,
              premium: insurance.premium,
              daysUntilRenewal,
            }
          );

          if (success) {
            // Aktualizuj lastReminderSent
            await prisma.insurance.update({
              where: { id: insurance.id },
              data: { lastReminderSent: now },
            });

            // Vytvor notifikáciu v app
            await prisma.notification.create({
              data: {
                userId: insurance.userId,
                type: 'insurance_renewal',
                title: 'Pripomienka obnovenia poistky',
                message: `Vaša poistka ${this.getTypeLabel(insurance.type)} u ${insurance.provider} končí o ${daysUntilRenewal} dní`,
                urgent: daysUntilRenewal <= 7,
                actionUrl: `/insurance`,
              },
            });

            sent++;
          } else {
            failed++;
          }
        }
      }

      console.log(`✅ Insurance reminders: checked ${insurances.length}, sent ${sent}, failed ${failed}`);

      return {
        checked: insurances.length,
        sent,
        failed,
      };
    } catch (error) {
      console.error('Insurance reminder check failed:', error);
      return {
        checked: 0,
        sent: 0,
        failed: 0,
      };
    }
  }

  /**
   * Určí či by sa mala poslať pripomienka
   */
  private shouldSendReminder(
    daysUntilRenewal: number,
    reminderDays: number,
    lastReminderSent: Date | null
  ): boolean {
    // Ak prešiel dátum obnovenia, nič neposielaj
    if (daysUntilRenewal < 0) {
      return false;
    }

    // Ak sme už v reminderDays období
    if (daysUntilRenewal <= reminderDays) {
      // Ak ešte nebola poslaná žiadna pripomienka
      if (!lastReminderSent) {
        return true;
      }

      // Ak je to urgentné (7 dní alebo menej) a posledná pripomienka bola pred viac ako 3 dňami
      if (daysUntilRenewal <= 7) {
        const daysSinceLastReminder = Math.floor(
          (new Date().getTime() - new Date(lastReminderSent).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastReminder >= 3;
      }

      // Inak pošli len raz (už bola poslaná)
      return false;
    }

    return false;
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      car: 'Autopoisťovka',
      home: 'Poistenie domácnosti',
      health: 'Zdravotné poistenie',
      life: 'Životné poistenie',
    };
    return labels[type] || type;
  }
}
