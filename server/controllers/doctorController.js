import Doctor from '../models/Doctor.js';

export const getDoctors = async (req, res) => {
  try {
    const { search, specialty } = req.query;
    const filter = {};
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
    
    const filter = { specialty: { $in: specialtyList } };
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
