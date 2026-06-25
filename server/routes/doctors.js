import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDoctors, getDoctorById, getSpecialties, recommendDoctors, getDoctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/profile', protect, getDoctorProfile);
router.put('/profile', protect, updateDoctorProfile);
router.get('/specialties', getSpecialties);
router.post('/recommend', recommendDoctors);
router.get('/:id', getDoctorById);

export default router;
