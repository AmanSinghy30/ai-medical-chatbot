import express from 'express';
import { getDoctors, getDoctorById, getSpecialties, recommendDoctors } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specialties', getSpecialties);
router.post('/recommend', recommendDoctors);
router.get('/:id', getDoctorById);

export default router;
