import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const dashboardController = new DashboardController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

router.get('/overview', (req, res) => dashboardController.getOverview(req, res));
router.get('/stats', (req, res) => dashboardController.getStats(req, res));

export default router;
