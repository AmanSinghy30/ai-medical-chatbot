import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export const getAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const filter = {};
    if (req.user.role === 'doctor' && req.query.asPatient !== 'true') {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (doctorProfile) {
        filter.doctor = doctorProfile._id;
      } else {
        filter.doctor = null; // No appointments if no profile
      }
    } else {
      filter.patient = req.user.id;
    }
    
    if (status) filter.status = status;
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['pending', 'confirmed'] };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email age gender allergies chronicConditions')
      .populate('doctor', 'name specialty hospital image location experience consultationFee')
      .sort({ date: 1, timeSlot: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTomorrowAppointments = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await Appointment.find({
      date: { $gte: tomorrow, $lt: dayAfter },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('doctor', 'name specialty hospital')
      .populate('patient', 'name email');

    const formatted = appointments.map((apt) => ({
      appointmentId: apt._id,
      patientId: apt.patient?._id,
      patientEmail: apt.patient?.email,
      patientName: apt.patient?.name,
      doctorId: apt.doctor?._id,
      doctorName: apt.doctor?.name,
      specialization: apt.doctor?.specialty,
      appointmentDate: apt.date.toISOString().split('T')[0],
      appointmentTime: apt.timeSlot,
      type: apt.type,
      status: apt.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id })
      .populate('doctor', 'name specialty hospital image location consultationFee');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, reason, symptoms, conditions } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // 1. Application-level check: does an active appointment already exist for this slot?
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(409).json({
        message: 'This time slot is already booked. Please select another time.',
        bookedBy: existing.patient.toString() === req.user.id ? 'you' : 'another patient',
      });
    }

    // 2. Create the appointment (unique index catches any remaining race condition)
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'in-person',
      reason: reason || '',
      symptoms: symptoms || [],
      conditions: conditions || [],
      consultId: 'CS-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      status: 'pending',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'name specialty hospital image userId')
      .populate('patient', 'name email appointmentEmail');

    const doctorUser = await User.findById(populated.doctor.userId);

    const patientEmailToUse = populated.patient.appointmentEmail || populated.patient.email;
    const doctorEmailToUse = doctorUser ? (doctorUser.appointmentEmail || doctorUser.email) : '';

    // Trigger n8n webhook asynchronously
    fetch('http://localhost:5678/webhook/appointment-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'booked',
        appointmentId: populated._id,
        doctorId: populated.doctor._id,
        patientId: populated.patient._id,
        patientEmail: patientEmailToUse,
        patientName: populated.patient.name,
        doctorName: populated.doctor.name,
        doctorEmail: doctorEmailToUse,
        appointmentDate: populated.date.toISOString().split('T')[0],
        appointmentTime: populated.timeSlot,
        specialization: populated.doctor.specialty
      })
    }).catch(err => console.error('Failed to trigger n8n webhook:', err));

    res.status(201).json(populated);
  } catch (error) {
    // 3. Catch unique index violation (duplicate slot) as final safety net
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This time slot was just booked by another user. Please refresh and select a different time.' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      req.body,
      { new: true }
    ).populate('doctor', 'name specialty hospital image');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const bookedSlots = await Appointment.find({
      doctor: doctorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');
    
    const allSlots = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
    ];
    
    const booked = bookedSlots.map((a) => a.timeSlot);
    let available = allSlots.filter((slot) => !booked.includes(slot));
    
    // Filter past time slots if booking is for today
    const reqDate = new Date(date);
    const today = new Date();
    if (reqDate.toDateString() === today.toDateString()) {
      available = available.filter((slot) => {
        const [timeStr, modifier] = slot.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const slotDate = new Date();
        slotDate.setHours(hours, minutes, 0, 0);
        
        return slotDate > today;
      });
    }
    
    res.json({ doctorId, date, available, booked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// n8n Webhook handlers
export const n8nConfirmAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { confirmationSent: true, status: 'confirmed' },
      { new: true }
    ).populate('doctor patient');
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const n8nSendReminder = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { reminderSent: true },
      { new: true }
    ).populate('doctor patient');
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
