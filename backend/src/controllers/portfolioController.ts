import { Response } from 'express';
import { AuthRequest } from '../types';
import { PortfolioService } from '../services/portfolioService';

const portfolioService = new PortfolioService();

export class PortfolioController {
  async getInvestments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const investments = await portfolioService.getInvestments(userId);

      res.json({
        status: 'success',
        data: investments,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getInvestment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const investment = await portfolioService.getInvestment(id, userId);

      res.json({
        status: 'success',
        data: investment,
      });
    } catch (error: any) {
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async createInvestment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const investment = await portfolioService.createInvestment(userId, req.body);

      res.status(201).json({
        status: 'success',
        data: investment,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async updateInvestment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const investment = await portfolioService.updateInvestment(id, userId, req.body);

      res.json({
        status: 'success',
        data: investment,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async deleteInvestment(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await portfolioService.deleteInvestment(id, userId);

      res.json({
        status: 'success',
        message: 'Investícia odstránená',
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getPortfolioSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const summary = await portfolioService.getPortfolioSummary(userId);

      res.json({
        status: 'success',
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
