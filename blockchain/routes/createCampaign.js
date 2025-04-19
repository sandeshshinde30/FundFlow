import express from 'express';
import User from '../models/user.js';
import Campaign from '../models/campaign.js';

const router = express.Router();

// Function to generate a random 10-digit campaign ID
const generateCampaignId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Create Campaign Route
router.post('/', async (req, res) => {
  const {
    walletAddress,
    name,
    title,
    category,
    description,
    target,
    deadline,
    image
  } = req.body;

  try {
    // Check if the wallet address exists in the User collection
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Wallet address not associated with any user' });
    }

    // Check if all required fields are provided
    if (!name || !title || !category || !description || !target || !deadline || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the wallet address is already associated with a campaign
    // const existingCampaign = await Campaign.findOne({ walletAddress: walletAddress.toLowerCase() });
    // if (existingCampaign) {
    //   return res.status(400).json({ message: 'Wallet address is already associated with a campaign' });
    // }

    // Generate a random 10-digit campaign ID
    const campaignId = generateCampaignId();

    // Create a new Campaign object
    const newCampaign = new Campaign({
      walletAddress: walletAddress.toLowerCase(),
      name,
      title,
      category,
      description,
      target: parseFloat(target),
      deadline,
      image,
      campaignId,
      raised: 0,
      createdAt: new Date(),
    });

    // Save the campaign to the database
    await newCampaign.save();

    // Update user's campaign count and total funds raised
    user.totalCampaigns += 1;
    user.totalFundsRaised += parseFloat(target);
    await user.save();

    return res.status(201).json({ message: 'Campaign created successfully', campaign: newCampaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ message: 'Error creating campaign' });
  }
});

export default router;
