import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorAvailability,
  getTomorrowAppointments,
  n8nConfirmAppointment,
  n8nSendReminder,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/', protect, getAppointments);
router.get('/tomorrow', protect, getTomorrowAppointments);
router.post('/', protect, createAppointment);
router.get('/availability', protect, getDoctorAvailability);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

// n8n webhook endpoints (no auth required for n8n automation)
router.post('/webhook/confirm', n8nConfirmAppointment);
router.post('/webhook/reminder', n8nSendReminder);

export default router;
