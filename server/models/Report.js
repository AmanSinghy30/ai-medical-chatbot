import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  chatSession: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  title: { type: String, default: 'Medical Consultation Report' },
  // AI Assessment
  possibleConditions: [{
    name: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    severity: { type: String, enum: ['low', 'moderate', 'high', 'urgent'] },
    description: { type: String },
  }],
  recommendedSpecialties: [{ type: String }],
  // RAG Sources
  knowledgeSources: [{
    id: { type: String },
    disease: { type: String },
    description: { type: String },
    confidence: { type: Number },
  }],
  // Recommendations
  selfCare: [{ type: String }],
  medicines: [{
    name: { type: String },
    dosage: { type: String },
    notes: { type: String },
  }],
  followUp: { type: String, default: '' },
  // Doctor findings (if appointment completed)
  doctorDiagnosis: { type: String },
  doctorNotes: { type: String },
  prescription: [{ type: String }],
  // Report metadata
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'finalized', 'archived'], default: 'draft' },
  pdfUrl: { type: String },
  // n8n tracking
  emailSent: { type: Boolean, default: false },
  n8nWorkflowId: { type: String },
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;
