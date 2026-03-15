import { Request, Response } from 'express';
import { MarketDataService } from '../services/marketDataService';

const marketDataService = new MarketDataService();

export class MarketController {
  async getCryptoPrice(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const price = await marketDataService.getCryptoPrice(symbol);

      res.json({
        status: 'success',
        data: {
          symbol: symbol.toUpperCase(),
          price,
          currency: 'USD',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getStockPrice(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const price = await marketDataService.getStockPrice(symbol);

      res.json({
        status: 'success',
        data: {
          symbol: symbol.toUpperCase(),
          price,
          currency: 'USD',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getDefiRates(req: Request, res: Response) {
    try {
      const rates = await marketDataService.getDefiRates();

      res.json({
        status: 'success',
        data: rates,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async updatePortfolioPrices(req: Request, res: Response) {
    try {
      const { investments } = req.body;

      if (!Array.isArray(investments)) {
        return res.status(400).json({
          status: 'error',
          message: 'Investments musí byť array',
        });
      }

      const updated = await marketDataService.updatePortfolioPrices(investments);

      res.json({
        status: 'success',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
