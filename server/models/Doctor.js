import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, default: '' },
  experience: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  hospital: { type: String, default: '' },
  location: { type: String, default: '' },
  consultationFee: { type: Number, default: 0 },
  availableNext: { type: String, default: '' },
  image: { type: String, default: '' },
  bio: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
