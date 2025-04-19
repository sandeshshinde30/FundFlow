import express from 'express';
import Campaign from '../models/campaign.js';
import Transaction from '../models/transaction.js';
import { saveData } from '../storage.js';

export default (blockchain) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const { campaignId, walletAddress } = req.body;

      if (!campaignId || !walletAddress) {
        return res.status(400).json({ 
          success: false, 
          message: 'Campaign ID and wallet address are required' 
        });
      }

      // Find the campaign
      const campaign = await Campaign.findOne({ campaignId });
      if (!campaign) {
        return res.status(404).json({ 
          success: false, 
          message: 'Campaign not found' 
        });
      }

      // Verify the requester is the campaign owner
      if (campaign.walletAddress !== walletAddress) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only the campaign owner can withdraw funds' 
        });
      }

      // Check if the campaign has raised at least 100% of its target
      if (campaign.raised < campaign.target) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot withdraw funds. Campaign has only raised ${Math.round((campaign.raised / campaign.target) * 100)}% of its target.` 
        });
      }

      // Create withdrawal transaction
      const transaction = new Transaction({
        sender: 'System',
        receiver: walletAddress,
        amount: campaign.raised,
        type: 'withdrawal',
        note: `Withdrawal of funds from campaign: ${campaign.title} (${campaignId})`
      });
      await transaction.save();

      // Add to blockchain
      blockchain.newTransaction({
        type: 'withdrawal',
        campaignId,
        sender: 'System',
        recipient: walletAddress,
        amount: campaign.raised,
        timestamp: Date.now()
      });

      // Create a block immediately (no PoW)
      const lastBlock = blockchain.lastBlock;
      const dummyProof = 0;
      const previousHash = blockchain.hash(lastBlock);
      const newBlock = blockchain.newBlock(dummyProof, previousHash);

      // Save chain
      saveData(blockchain);

      // Delete the campaign after successful withdrawal
      await Campaign.deleteOne({ campaignId });

      res.status(200).json({
        success: true,
        message: `Successfully withdrawn ${campaign.raised} INR. The campaign has been completed.`,
        amount: campaign.raised,
        block: newBlock
      });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process withdrawal' 
      });
    }
  });

  return router;
}; 