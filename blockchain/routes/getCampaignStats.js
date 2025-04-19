import express from 'express';
import Campaign from '../models/campaign.js';
import Transaction from '../models/transaction.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    // Initialize stats object
    const stats = {
      totalCampaigns: 0,
      totalFundsRaised: 0,
      totalTransactions: 0
    };
    
    // If walletAddress is provided, get user-specific stats
    if (walletAddress) {
      // Count user's campaigns
      stats.totalCampaigns = await Campaign.countDocuments({ walletAddress });
      
      // Sum of all raised funds for user's campaigns
      const userCampaigns = await Campaign.find({ walletAddress });
      userCampaigns.forEach(campaign => {
        stats.totalFundsRaised += campaign.raised;
      });
      
      // Count transactions related to user
      stats.totalTransactions = await Transaction.countDocuments({
        $or: [
          { sender: walletAddress },
          { receiver: walletAddress }
        ]
      });
    } else {
      // Get platform-wide stats
      stats.totalCampaigns = await Campaign.countDocuments();
      
      // Sum of all raised funds across all campaigns
      const allCampaigns = await Campaign.find();
      allCampaigns.forEach(campaign => {
        stats.totalFundsRaised += campaign.raised;
      });
      
      // Count all transactions
      stats.totalTransactions = await Transaction.countDocuments();
    }
    
    // Round the total funds to 2 decimal places
    stats.totalFundsRaised = Math.round(stats.totalFundsRaised * 100) / 100;
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch campaign statistics' });
  }
});

export default router; 