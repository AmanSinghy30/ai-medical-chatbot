import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  type: { type: String, enum: ['in-person', 'telehealth'], default: 'in-person' },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  symptoms: [{ type: String }],
  conditions: [{ type: String }],
  consultId: { type: String }, // Unique consultation identifier
  // n8n automation tracking
  confirmationSent: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  reportGenerated: { type: Boolean, default: false },
  n8nWebhookId: { type: String },
}, { timestamps: true });

// Partial unique index: only active (pending/confirmed) appointments block a slot.
// Cancelled appointments are ignored, so cancelled slots can be re-booked.
appointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } },
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
