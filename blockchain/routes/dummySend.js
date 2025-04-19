import express from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';
import User from '../models/user.js'; // Assuming your Mongoose model for users
import Transaction from '../models/transaction.js';
const router = express.Router();

router.post('/', async (req, res) => {
  const { walletAddress, to, amount,type } = req.body;

  if (!walletAddress || !to || !amount || !type) {
    return res.status(400).json({ error: 'Missing required fields: walletAddress, to, amount, type' });
  }

  try {
    // Step 1: Fetch user by walletAddress
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found with given walletAddress' });
    }

    const { walletAddress: from, publicKey, privateKey } = user;

    const timestamp = Date.now();
    const transaction = { from, to, amount, type, timestamp };

    

    // Step 2: Sign the transaction
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(transaction));
    sign.end();

    const signature = sign.sign(privateKey, 'hex');

    console.log(transaction);
    console.log("\n\n");
    console.log(signature);


    // const signature = "dasds";

    // Step 3: Send signed transaction to /sendTransaction
    const response = await fetch('http://localhost:3000/sendTransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transaction,
        signature
      })
    });

    const result = await response.json();
    return res.status(response.status).json(result);

  } catch (err) {
    console.error('❌ Dummy transaction error:', err);
    return res.status(500).json({ error: 'Failed to process dummy transaction' });
  }
});

export default router;
