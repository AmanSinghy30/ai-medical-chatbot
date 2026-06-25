import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMedicines, getMedicineById, recommendMedicines, createMedicine } from '../controllers/medicineController.js';

const router = express.Router();

router.get('/', getMedicines);
router.post('/', protect, createMedicine);
router.post('/recommend', recommendMedicines);
router.get('/:id', getMedicineById);

export default router;
