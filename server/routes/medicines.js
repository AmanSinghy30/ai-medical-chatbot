import express from 'express';
import { getMedicines, getMedicineById } from '../controllers/medicineController.js';

const router = express.Router();

router.get('/', getMedicines);
router.get('/:id', getMedicineById);

export default router;
