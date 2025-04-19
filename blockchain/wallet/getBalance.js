import express from 'express';
import User from '../models/user.js';  // Import the User model

const router = express.Router();

// POST /api/getBalance
router.post("/", async (req, res) => {
  const walletAddress = req.body.walletAddress?.toLowerCase();

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ walletAddress: user.walletAddress, balance: user.balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;  // Use ES6 export
