import { Response } from 'express';
import { AuthRequest } from '../types';
import { ReportService } from '../services/reportService';

const reportService = new ReportService();

export class ReportController {
  async getMonthlyReport(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

      const report = await reportService.generateMonthlyReport(userId, year, month);

      res.json({
        status: 'success',
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getQuarterlyReport(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const quarter = parseInt(req.query.quarter as string) || Math.ceil((new Date().getMonth() + 1) / 3);

      const report = await reportService.generateQuarterlyReport(userId, year, quarter);

      res.json({
        status: 'success',
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getYearlyReport(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const report = await reportService.generateYearlyReport(userId, year);

      res.json({
        status: 'success',
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getTaxReport(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear() - 1;

      const report = await reportService.generateTaxReport(userId, year);

      res.json({
        status: 'success',
        data: report,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
