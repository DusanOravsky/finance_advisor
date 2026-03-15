import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolioController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const portfolioController = new PortfolioController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

router.get('/', (req, res) => portfolioController.getInvestments(req, res));
router.get('/summary', (req, res) => portfolioController.getPortfolioSummary(req, res));
router.get('/:id', (req, res) => portfolioController.getInvestment(req, res));
router.post('/', (req, res) => portfolioController.createInvestment(req, res));
router.put('/:id', (req, res) => portfolioController.updateInvestment(req, res));
router.delete('/:id', (req, res) => portfolioController.deleteInvestment(req, res));

export default router;
