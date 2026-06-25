import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export const getDoctors = async (req, res) => {
  try {
    const { search, specialty } = req.query;
    const filter = { isProfileComplete: { $ne: false } };
    if (specialty && specialty !== 'All Specialties') {
      filter.specialty = specialty;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }
    const doctors = await Doctor.find(filter);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty');
    res.json(['All Specialties', ...specialties]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// n8n workflow: recommend doctors by specialty list
export const recommendDoctors = async (req, res) => {
  try {
    const { specialists, city } = req.body;
    const specialtyList = Array.isArray(specialists) ? specialists : JSON.parse(specialists || '[]');
    
    const filter = { specialty: { $in: specialtyList }, isProfileComplete: { $ne: false } };
    if (city) {
      filter.location = { $regex: city, $options: 'i' };
    }
    
    const doctors = await Doctor.find(filter)
      .sort({ rating: -1, experience: -1 })
      .limit(10);
    
    res.json({ doctors, count: doctors.length, requestedSpecialties: specialtyList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const { specialty, experience, hospital, location, consultationFee, image, bio } = req.body;
    let doctor = await Doctor.findOne({ userId: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.specialty = specialty || doctor.specialty;
    doctor.experience = experience || doctor.experience;
    doctor.hospital = hospital || doctor.hospital;
    doctor.location = location || doctor.location;
    doctor.consultationFee = consultationFee !== undefined ? consultationFee : doctor.consultationFee;
    
    let finalImage = image;
    if (!finalImage && !doctor.image) {
      const user = await User.findById(req.user.id);
      const gender = user?.gender?.toLowerCase() || '';
      if (gender === 'female') {
        finalImage = 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png'; // Female doctor silhouette
      } else {
        finalImage = 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'; // Male/Generic doctor silhouette
      }
    }
    doctor.image = finalImage || doctor.image;
    
    doctor.bio = bio || doctor.bio;
    doctor.isProfileComplete = true; // Mark as complete

    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
