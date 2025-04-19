import express from 'express';
import { saveData } from '../storage.js';
import Campaign from '../models/campaign.js';
import Transaction from '../models/transaction.js';
import { loadData } from '../storage.js';
import User from '../models/user.js';

export default (blockchain) => {
  const router = express.Router();

  router.post('/contribute', async (req, res) => {
    try {
      const { campaignId, walletAddress, amount } = req.body;
  
      if (!campaignId || !walletAddress || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Missing or invalid data' });
      }
  
      console.log("📥 Contribution transaction received");
  
      // Find contributor (sender)
      const sender = await User.findOne({ walletAddress });
      if (!sender) {
        return res.status(404).json({ success: false, message: 'Sender not found' });
      }
  
      // Check for sufficient balance
      if (sender.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
  
      // Find campaign
      const campaign = await Campaign.findOne({ campaignId });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
  
      // Deduct from sender
      sender.balance -= amount;
      sender.totalTransactions = (sender.totalTransactions || 0) + 1;
      await sender.save();
  
      // Update campaign raised amount
      campaign.raised += amount;
      await campaign.save();
  
      // Create transaction record
      const transaction = new Transaction({
        sender: walletAddress,
        receiver: campaign.walletAddress,
        amount,
        type: 'contribution',
        note: `Contribution to campaign: ${campaign.title}`
      });
      await transaction.save();
  
      // Add structured transaction to blockchain
      blockchain.newTransaction({
        type: 'contribution',
        campaignId,
        sender: walletAddress,
        recipient: campaign.walletAddress,
        amount,
        timestamp: Date.now()
      });
  
      const lastBlock = blockchain.lastBlock;
      const dummyProof = 0;
      const previousHash = blockchain.hash(lastBlock);
      const newBlock = blockchain.newBlock(dummyProof, previousHash);
  
      saveData(blockchain);
  
      res.status(201).json({
        success: true,
        message: 'Contribution successful!',
        block: newBlock,
      });
    } catch (error) {
      console.error('Error processing contribution:', error);
      res.status(500).json({ success: false, message: 'Failed to process contribution' });
    }
  });
  

  // Add endpoint to get contributions for a campaign
  router.post('/getContributions', async (req, res) => {
    try {
      const { campaignId } = req.body;
  
      if (!campaignId) {
        return res.status(400).json({ success: false, message: 'Campaign ID is required' });
      }
  
      // Find the campaign to get the wallet address
      const campaign = await Campaign.findOne({ campaignId });
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }
  
      // Load blockchain data
      const data = loadData();
      const { chain } = data;
  
      // Extract and flatten all transactions
      const allTransactions = chain.flatMap(block =>
        block.transactions.map(tx => tx.sender || tx) // unwrapping nested sender object
      );
  
      // Filter relevant contribution transactions
      const contributions = allTransactions.filter(tx =>
        tx.type === 'contribution' &&
        tx.campaignId === campaignId &&
        tx.recipient === campaign.walletAddress
      );

      // console.log("Contributions:", contributions);
  
      res.status(200).json(contributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch contributions' });
    }
  });

  return router;
};
