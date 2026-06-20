import express from 'express';
import { generateAIResponse, analyzeSymptoms, getRAGSources, getDiseaseSpecialtyMap } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateAIResponse);
router.post('/analyze', analyzeSymptoms);
router.get('/rag', getRAGSources);
router.get('/specialty-map', getDiseaseSpecialtyMap);

export default router;
