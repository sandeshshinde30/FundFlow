// routes/campaign.js
import express from 'express';
import Campaign from '../models/campaign.js'; // adjust path if needed

const router = express.Router();

// GET all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({});
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error.message);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

export default router;
