import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  type: { type: String, enum: ['Tablet', 'Syrup', 'Capsule', 'Ointment', 'Injection'], required: true },
  category: { type: String, required: true },
  recommendedDosage: { type: String, required: true },
  sideEffects: [{ type: String }],
  precautions: { type: String, required: true },
  isOTC: { type: Boolean, default: true },
  price: { type: String, required: true },
}, { timestamps: true });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
