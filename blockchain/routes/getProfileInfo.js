import express from "express";
import User from "../models/user.js"; // Adjust path based on your project structure

const router = express.Router();

// POST /api/getProfileInfo
router.post("/", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    // Find user by wallet address (make it lowercase to handle case sensitivity)
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user profile information
    return res.json({
      name: user.name,
      email: user.email,
      balance: user.balance,
      walletAddress: user.walletAddress,
      totalCampaigns: user.totalCampaigns,
      totalFundsRaised: user.totalFundsRaised,
      totalTransactions: user.totalTransactions,
      publicKey: user.publicKey,
      privateKey: user.privateKey,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
