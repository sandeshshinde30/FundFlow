// routes/getCampaignsInCurrentMonth.js
import express from 'express';
import Campaign from '../models/campaign.js';

const router = express.Router();

router.post("/", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get campaigns for the wallet
    const campaigns = await Campaign.find({ walletAddress });

    // Filter campaigns created in the current month
    const campaignsThisMonth = campaigns.filter(campaign => {
      const createdAt = new Date(campaign.createdAt);
      return (
        createdAt.getMonth() === currentMonth &&
        createdAt.getFullYear() === currentYear
      );
    });

    res.status(200).json({
      count: campaignsThisMonth.length,
      campaigns: campaignsThisMonth.map(({ campaignId, title, createdAt }) => ({
        campaignId,
        title,
        createdAt,
      }))
    });

  } catch (error) {
    console.error("Error getting campaigns count:", error);
    res.status(500).json({ error: "Failed to get campaigns count" });
  }
});

export default router;
