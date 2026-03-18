import { Router } from 'express';
import { InsuranceController } from '../controllers/insuranceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const insuranceController = new InsuranceController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

router.get('/', (req, res) => insuranceController.getInsurances(req, res));
router.get('/stats', (req, res) => insuranceController.getStats(req, res));
router.get('/renewals', (req, res) => insuranceController.getUpcomingRenewals(req, res));
router.get('/compare/:type', (req, res) => insuranceController.compareInsurance(req, res));
router.get('/scrape/:type', (req, res) => insuranceController.scrapeBestOffers(req, res));
router.get('/:id', (req, res) => insuranceController.getInsurance(req, res));
router.get('/:id/analyze', (req, res) => insuranceController.analyzeInsurance(req, res));
router.post('/', (req, res) => insuranceController.createInsurance(req, res));
router.post('/:id/send-reminder', (req, res) => insuranceController.sendReminderEmail(req, res));
router.put('/:id', (req, res) => insuranceController.updateInsurance(req, res));
router.delete('/:id', (req, res) => insuranceController.deleteInsurance(req, res));

export default router;
