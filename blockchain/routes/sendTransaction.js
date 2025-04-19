// routes/sendTransaction.js
import express from 'express';
import User from '../models/user.js';
import Transaction from '../models/transaction.js'; // For storing transaction in MongoDB
import { saveData } from '../storage.js';
import crypto from 'crypto';

export default (blockchain) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { from, to, amount, timestamp, signature, type } = req.body;

    if (!from || !to || !amount || !timestamp || !signature || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Find sender and receiver
      const sender = await User.findOne({ walletAddress: from });
      const receiver = await User.findOne({ walletAddress: to });

      if (!sender) return res.status(404).json({ error: 'Sender not found' });
      if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

      // Check balance
      if (sender.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Verify signature
      const transaction = { from, to, amount,type,timestamp };
      console.log(transaction);
      const verify = crypto.createVerify('SHA256');
      verify.update(JSON.stringify(transaction));
      verify.end();

      // console.log("\n\n",signature);

      const isValid = verify.verify(sender.publicKey, signature, 'hex');
      console.log("\n\n",sender.publicKey);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Perform fund transfer
      sender.balance -= amount;
      receiver.balance += amount;

      await sender.save();
      await receiver.save();

      // Save transaction to MongoDB
      const mongoTx = new Transaction({
        sender: from,
        receiver: to,
        amount,
        type,
        timestamp
      });
      await mongoTx.save();

      // Add transaction to blockchain
      blockchain.newTransaction({
        type,
        campaignId: 'generic',
        sender: from,
        recipient: to,
        amount,
        timestamp
      });

      const lastBlock = blockchain.lastBlock;
      const dummyProof = 0;
      const previousHash = blockchain.hash(lastBlock);
      const newBlock = blockchain.newBlock(dummyProof, previousHash);

      // Save blockchain
      saveData(blockchain);

      res.status(201).json({
        message: 'Transaction successful and stored on blockchain!',
        block: newBlock,
        senderBalance: sender.balance.toFixed(2),
        receiverBalance: receiver.balance.toFixed(2)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during transaction' });
    }
  });

  return router;
};
