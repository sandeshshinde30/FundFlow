// routes/getCampaignDetails.js
import express from 'express';
import Campaign from '../models/campaign.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { campaignId } = req.body;

  if (!campaignId) {
    return res.status(400).json({ message: 'campaignId is required' });
  }

  try {
    const campaign = await Campaign.findOne({ campaignId });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign details:", error.message);
    res.status(500).json({ message: "Failed to fetch campaign details" });
  }
});

export default router;
