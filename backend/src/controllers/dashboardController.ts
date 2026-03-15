import { Response } from 'express';
import { AuthRequest } from '../types';
import { DashboardService } from '../services/dashboardService';

const dashboardService = new DashboardService();

export class DashboardController {
  async getOverview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const overview = await dashboardService.getOverview(userId);

      res.json({
        status: 'success',
        data: overview,
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
      const stats = await dashboardService.getStats(userId);

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
