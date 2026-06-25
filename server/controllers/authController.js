import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medisage_dev_secret', { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, allergies, chronicConditions } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    let finalName = name;
    if (role === 'doctor' && !name.toLowerCase().startsWith('dr.')) {
      finalName = `Dr. ${name}`;
    }

    const user = await User.create({ name: finalName, email, password, role, age, gender, allergies, chronicConditions });
    
    if (role === 'doctor') {
      await Doctor.create({
        userId: user._id,
        name: user.name,
        isProfileComplete: false
      });
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      gender: user.gender,
      allergies: user.allergies,
      chronicConditions: user.chronicConditions,
      appointmentEmail: user.appointmentEmail,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (user.role === 'doctor') {
        const doctorProfile = await Doctor.findOne({ name: user.name });
        if (doctorProfile && !doctorProfile.userId) {
          doctorProfile.userId = user._id;
          await doctorProfile.save();
        }
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        appointmentEmail: user.appointmentEmail,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
