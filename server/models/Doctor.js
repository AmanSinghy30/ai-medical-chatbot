import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  hospital: { type: String, required: true },
  location: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  availableNext: { type: String, required: true },
  image: { type: String, required: true },
  bio: { type: String, required: true },
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
