import HealthTip from '../models/HealthTip.js';

export const getHealthTips = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    const tips = await HealthTip.find(filter);
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthTipById = async (req, res) => {
  try {
    const tip = await HealthTip.findById(req.params.id);
    if (!tip) return res.status(404).json({ message: 'Health tip not found' });
    res.json(tip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await HealthTip.distinct('category');
    res.json(['All', ...categories]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
