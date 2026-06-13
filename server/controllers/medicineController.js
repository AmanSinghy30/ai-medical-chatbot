import Medicine from '../models/Medicine.js';

export const getMedicines = async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = {};
    if (type === 'otc') filter.isOTC = true;
    if (type === 'rx') filter.isOTC = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const medicines = await Medicine.find(filter);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
