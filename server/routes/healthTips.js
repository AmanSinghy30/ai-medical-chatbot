import express from 'express';
import { getHealthTips, getHealthTipById, getCategories } from '../controllers/healthTipController.js';

const router = express.Router();

router.get('/', getHealthTips);
router.get('/categories', getCategories);
router.get('/:id', getHealthTipById);

export default router;
