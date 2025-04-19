// routes/campaign.js
import express from 'express';
import Campaign from '../models/campaign.js'; // adjust path if needed

const router = express.Router();

// POST campaigns by walletAddress
router.post('/', async (req, res) => {
  const { walletAddress } = req.body;  // Get the walletAddress from the request body

  if (!walletAddress) {
    return res.status(400).json({ message: 'walletAddress is required' });
  }

  try {
    // Find campaigns associated with the walletAddress (case-insensitive search)
    const campaigns = await Campaign.find({ walletAddress: walletAddress.toLowerCase() });

    if (campaigns.length === 0) {
      return res.status(404).json({ message: 'No campaigns found for this wallet address' });
    }

    res.status(200).json(campaigns);  // Return the list of campaigns
  } catch (error) {
    console.error("Error fetching campaigns:", error.message);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

export default router;
