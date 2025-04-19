import express from 'express';
import Campaign from '../models/campaign.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    // Create a search regex pattern
    const searchRegex = new RegExp(query, 'i');
    
    // Search by title, name, description or category
    const campaigns = await Campaign.find({
      $or: [
        { title: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error('Error searching campaigns:', error);
    res.status(500).json({ success: false, message: 'Failed to search campaigns' });
  }
});

export default router; 