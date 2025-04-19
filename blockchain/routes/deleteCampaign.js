import express from 'express';
import Campaign from '../models/campaign.js';
import Transaction from '../models/transaction.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { campaignId, walletAddress } = req.body;

    if (!campaignId || !walletAddress) {
      return res.status(400).json({ success: false, message: 'Campaign ID and wallet address are required' });
    }

    // Find the campaign
    const campaign = await Campaign.findOne({ campaignId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check if the requester is the campaign owner
    if (campaign.walletAddress !== walletAddress) {
      return res.status(403).json({ success: false, message: 'Only the campaign owner can delete this campaign' });
    }

    // Check if there are any contributions
    if (campaign.raised > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete campaign with contributions. Please withdraw funds first.' 
      });
    }

    // Delete the campaign
    await Campaign.deleteOne({ campaignId });

    res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ success: false, message: 'Failed to delete campaign' });
  }
});

export default router; 