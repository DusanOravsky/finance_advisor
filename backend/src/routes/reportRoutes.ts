import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const reportController = new ReportController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

router.get('/monthly', (req, res) => reportController.getMonthlyReport(req, res));
router.get('/quarterly', (req, res) => reportController.getQuarterlyReport(req, res));
router.get('/yearly', (req, res) => reportController.getYearlyReport(req, res));
router.get('/tax', (req, res) => reportController.getTaxReport(req, res));

export default router;
