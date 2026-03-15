import { Response } from 'express';
import { AuthRequest } from '../types';
import { AIService } from '../services/aiService';

const aiService = new AIService();

export class AIController {
  async chat(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Správa je povinná',
        });
      }

      const response = await aiService.chat(userId, message);

      res.json({
        status: 'success',
        data: response,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Chyba pri komunikácii s AI',
      });
    }
  }

  async analyzePortfolio(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const analysis = await aiService.analyzePortfolio(userId);

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

  async getChatHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await aiService.getChatHistory(userId, limit);

      res.json({
        status: 'success',
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async clearChatHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await aiService.clearChatHistory(userId);

      res.json({
        status: 'success',
        message: 'História vymazaná',
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
