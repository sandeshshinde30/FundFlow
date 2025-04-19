import express from 'express';
import User from '../models/user.js';  // Assuming the User model contains the wallet balance

const router = express.Router();

router.post('/', async (req, res) => {
  const { walletAddress, amount } = req.body;

  // Validate inputs
  if (!walletAddress || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid wallet address or amount' });
  }

  try {
    // Find the user by wallet address
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({ error: 'Wallet address not found' });
    }

    // Add the amount to the user's balance (assuming the User model has a 'balance' field)
    user.balance = user.balance + parseFloat(amount);

    // Save the updated user with the new balance
    await user.save();

    res.status(200).json({
      message: `Successfully credited ${amount} INR to wallet`,
      balance: user.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to credit wallet' });
  }
});

export default router;
