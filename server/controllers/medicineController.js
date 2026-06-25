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

export const recommendMedicines = async (req, res) => {
  try {
    const { category, possibleConditions } = req.body;
    
    // Find medicines matching the category
    let filter = {};
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    } else if (possibleConditions && possibleConditions.length > 0) {
      // Fallback: search by possible conditions
      const conditionStr = possibleConditions.join(' ');
      if (/headache|fever|pain/i.test(conditionStr)) filter.category = { $regex: 'analgesic', $options: 'i' };
      else if (/allergy|rash|itch/i.test(conditionStr)) filter.category = { $regex: 'antihistamine', $options: 'i' };
      else if (/gerd|reflux|acid/i.test(conditionStr)) filter.category = { $regex: 'proton pump', $options: 'i' };
      else if (/cough|throat/i.test(conditionStr)) filter.category = { $regex: 'cough', $options: 'i' };
      else return res.json({ medicines: [], count: 0 }); // No matched condition keywords
    } else {
      // If neither is provided, don't return any medicines
      return res.json({ medicines: [], count: 0 });
    }

    const medicines = await Medicine.find(filter).limit(3);
    res.json({ medicines, count: medicines.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const { name, genericName, type, category, recommendedDosage, sideEffects, precautions, isOTC, price } = req.body;
    const medicine = await Medicine.create({
      name,
      genericName,
      type,
      category,
      recommendedDosage,
      sideEffects,
      precautions,
      isOTC,
      price
    });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
