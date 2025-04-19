// routes/campaign.js
import express from 'express';
import Campaign from '../models/campaign.js'; // adjust path if needed

const router = express.Router();

// POST campaign details by campaignId
router.post('/', async (req, res) => {
  const { campaignId } = req.body;  // Get the campaignId from the request body

  if (!campaignId) {
    return res.status(400).json({ message: 'campaignId is required' });
  }

  try {
    // Find the campaign by campaignId
    const campaign = await Campaign.findOne({ campaignId });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json(campaign);  // Return the campaign details
  } catch (error) {
    console.error("Error fetching campaign details:", error.message);
    res.status(500).json({ message: "Failed to fetch campaign details" });
  }
});

export default router;
