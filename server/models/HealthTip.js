import mongoose from 'mongoose';

const healthTipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Nutrition', 'Mental Health', 'Sleep', 'Fitness', 'Immunity'], required: true },
  snippet: { type: String, required: true },
  fullContent: { type: String, required: true },
  readTime: { type: String, required: true },
  doctorRecommended: { type: String },
}, { timestamps: true });

const HealthTip = mongoose.model('HealthTip', healthTipSchema);
export default HealthTip;
