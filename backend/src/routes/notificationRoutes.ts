import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const notificationController = new NotificationController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

router.get('/', (req, res) => notificationController.getNotifications(req, res));
router.get('/unread-count', (req, res) => notificationController.getUnreadCount(req, res));
router.put('/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));
router.delete('/:id', (req, res) => notificationController.deleteNotification(req, res));
router.post('/generate', (req, res) => notificationController.generateNotifications(req, res));

export default router;
