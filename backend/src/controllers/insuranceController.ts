import { Response } from 'express';
import { AuthRequest } from '../types';
import { InsuranceService } from '../services/insuranceService';
import { InsuranceScrapingService } from '../services/insuranceScrapingService';
import { EmailService } from '../services/emailService';

const insuranceService = new InsuranceService();
const scrapingService = new InsuranceScrapingService();
const emailService = new EmailService();

export class InsuranceController {
  async getInsurances(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const insurances = await insuranceService.getInsurances(userId);

      res.json({
        status: 'success',
        data: insurances,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const insurance = await insuranceService.getInsurance(id, userId);

      res.json({
        status: 'success',
        data: insurance,
      });
    } catch (error: any) {
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async createInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const insurance = await insuranceService.createInsurance(userId, req.body);

      res.status(201).json({
        status: 'success',
        data: insurance,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async updateInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const insurance = await insuranceService.updateInsurance(id, userId, req.body);

      res.json({
        status: 'success',
        data: insurance,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async deleteInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await insuranceService.deleteInsurance(id, userId);

      res.json({
        status: 'success',
        message: 'Poistka odstránená',
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getUpcomingRenewals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const days = parseInt(req.query.days as string) || 90;
      const renewals = await insuranceService.getUpcomingRenewals(userId, days);

      res.json({
        status: 'success',
        data: renewals,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async compareInsurance(req: AuthRequest, res: Response) {
    try {
      const { type } = req.params;
      const comparison = await insuranceService.compareInsurance(type);

      res.json({
        status: 'success',
        data: comparison,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await insuranceService.getInsuranceStats(userId);

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async scrapeBestOffers(req: AuthRequest, res: Response) {
    try {
      const { type } = req.params;
      const { age, vehicle, propertyValue, currentPremium } = req.query;

      const userProfile = {
        age: age ? parseInt(age as string) : undefined,
        vehicle: vehicle as string,
        propertyValue: propertyValue ? parseFloat(propertyValue as string) : undefined,
        currentPremium: currentPremium ? parseFloat(currentPremium as string) : undefined,
      };

      const offers = await scrapingService.scrapeInsuranceOffers(type, userProfile);

      res.json({
        status: 'success',
        data: offers,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async analyzeInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const insurance = await insuranceService.getInsurance(id, userId);

      const analysis = await scrapingService.analyzeCurrentInsurance(
        {
          type: insurance.type,
          provider: insurance.provider,
          premium: insurance.premium,
          coverage: insurance.coverage,
        },
        { currentPremium: insurance.premium }
      );

      res.json({
        status: 'success',
        data: analysis,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async sendReminderEmail(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const insurance = await insuranceService.getInsurance(id, userId);
      const user = req.user!;

      const daysUntilRenewal = Math.ceil(
        (new Date(insurance.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const sent = await emailService.sendInsuranceRenewalReminder(user.email, {
        type: insurance.type,
        provider: insurance.provider,
        policyNumber: insurance.policyNumber,
        renewalDate: insurance.renewalDate,
        premium: insurance.premium,
        daysUntilRenewal,
      });

      if (sent) {
        // Aktualizuj lastReminderSent
        await insuranceService.updateInsurance(id, userId, {
          lastReminderSent: new Date(),
        });
      }

      res.json({
        status: 'success',
        message: sent ? 'Email odoslaný' : 'Email simulovaný (SMTP nekonfigurovaný)',
        data: { sent },
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
