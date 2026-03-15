import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const aiController = new AIController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

router.post('/chat', (req, res) => aiController.chat(req, res));
router.post('/analyze-portfolio', (req, res) => aiController.analyzePortfolio(req, res));
router.get('/chat/history', (req, res) => aiController.getChatHistory(req, res));
router.delete('/chat/history', (req, res) => aiController.clearChatHistory(req, res));

export default router;
