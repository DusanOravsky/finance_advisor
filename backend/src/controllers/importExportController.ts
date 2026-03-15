import { Response } from 'express';
import { AuthRequest } from '../types';
import { ImportExportService } from '../services/importExportService';

const importExportService = new ImportExportService();

export class ImportExportController {
  async importCSV(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { csvContent } = req.body;

      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'CSV obsah je povinný',
        });
      }

      const result = await importExportService.importHoldingsFromCSV(userId, csvContent);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async importJSON(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profileData = req.body;

      if (!profileData || typeof profileData !== 'object') {
        return res.status(400).json({
          status: 'error',
          message: 'JSON dáta sú povinné',
        });
      }

      const result = await importExportService.importClientProfile(userId, profileData);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async exportCSV(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const csv = await importExportService.exportPortfolioToCSV(userId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=portfolio.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async exportJSON(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await importExportService.exportClientProfile(userId);

      res.json({
        status: 'success',
        data: profile,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getSampleCSV(req: AuthRequest, res: Response) {
    const csv = importExportService.getSampleCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample-portfolio.csv');
    res.send(csv);
  }

  async getSampleJSON(req: AuthRequest, res: Response) {
    const json = importExportService.getSampleJSON();

    res.json({
      status: 'success',
      data: json,
    });
  }
}
