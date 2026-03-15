import { Response } from 'express';
import { AuthRequest } from '../types';
import { NotificationService } from '../services/notificationService';

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await notificationService.getNotifications(userId, limit);

      res.json({
        status: 'success',
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        status: 'success',
        data: { count },
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await notificationService.markAsRead(id, userId);

      res.json({
        status: 'success',
        message: 'Notifikácia označená ako prečítaná',
      });
    } catch (error: any) {
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await notificationService.markAllAsRead(userId);

      res.json({
        status: 'success',
        message: 'Všetky notifikácie označené ako prečítané',
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await notificationService.deleteNotification(id, userId);

      res.json({
        status: 'success',
        message: 'Notifikácia odstránená',
      });
    } catch (error: any) {
      res.status(404).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async generateNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const [insuranceNotifs, goalNotifs] = await Promise.all([
        notificationService.generateInsuranceRenewalNotifications(userId),
        notificationService.generateGoalNotifications(userId),
      ]);

      res.json({
        status: 'success',
        data: {
          generated: insuranceNotifs.length + goalNotifs.length,
          insurance: insuranceNotifs.length,
          goals: goalNotifs.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}
