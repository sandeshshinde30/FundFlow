// routes/register.js
import express from 'express';
import { generateWalletKeys } from '../wallet/generateKeys.js';
import User from '../models/user.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, password, email, type } = req.body;

  if (!name || !password || !email) {
    return res.status(400).json({ error: 'Invalid name, type, password, or email' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }
   
    const { walletAddress, publicKey, privateKey } = generateWalletKeys();

    const newUser = new User({
      name,
      password,
      email,  
      type,
      walletAddress,
      publicKey,
      privateKey,
      balance : 0,
      totalCampaigns : 0,
      totalFundsRaised : 0,
      totalTransactions : 0
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully!',
      walletAddress,
      publicKey,
      privateKey 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

export default router;
