import { Router } from 'express';
import { ImportExportController } from '../controllers/importExportController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const importExportController = new ImportExportController();

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

// Import
router.post('/csv', (req, res) => importExportController.importCSV(req, res));
router.post('/json', (req, res) => importExportController.importJSON(req, res));

// Export
router.get('/csv', (req, res) => importExportController.exportCSV(req, res));
router.get('/json', (req, res) => importExportController.exportJSON(req, res));

// Templates
router.get('/template/csv', (req, res) => importExportController.getSampleCSV(req, res));
router.get('/template/json', (req, res) => importExportController.getSampleJSON(req, res));

export default router;
