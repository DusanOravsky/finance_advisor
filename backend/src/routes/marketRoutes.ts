import { Router } from 'express';
import { MarketController } from '../controllers/marketController';

const router = Router();
const marketController = new MarketController();

// Public routes (nepotrebujú auth)
router.get('/crypto/:symbol', (req, res) => marketController.getCryptoPrice(req, res));
router.get('/stock/:symbol', (req, res) => marketController.getStockPrice(req, res));
router.get('/defi/rates', (req, res) => marketController.getDefiRates(req, res));
router.post('/portfolio/update-prices', (req, res) => marketController.updatePortfolioPrices(req, res));

export default router;
