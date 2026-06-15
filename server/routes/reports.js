import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getReports,
  getReportById,
  createReport,
  generateReportPDF,
  finalizeReport,
  deleteReport,
  n8nGenerateAndEmail,
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/', protect, getReports);
router.post('/', protect, createReport);
router.get('/:id', protect, getReportById);
router.get('/:id/pdf', protect, generateReportPDF);
router.put('/:id/finalize', protect, finalizeReport);
router.delete('/:id', protect, deleteReport);

// n8n webhook endpoint
router.post('/webhook/generate-email', n8nGenerateAndEmail);

export default router;
