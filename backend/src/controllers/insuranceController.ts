import { Response } from 'express';
import { AuthRequest } from '../types';
import { InsuranceService } from '../services/insuranceService';

const insuranceService = new InsuranceService();

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
}
