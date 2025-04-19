import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load blockchain data from file
const blockchainPath = path.join(__dirname, "../blockchain_data.json");

router.post("/", (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    const data = fs.readFileSync(blockchainPath);
    const blockchainData = JSON.parse(data);
    const blockchain = blockchainData.chain;
  
    const formattedTransactions = [];
  
    blockchain.forEach((block) => {
      if (block.transactions && Array.isArray(block.transactions)) {
        block.transactions.forEach((txObj) => {
          // Check different transaction formats
          const tx = txObj.sender || txObj;
          
          // Only include transactions for the requested wallet
          if (tx.sender === walletAddress || tx.recipient === walletAddress) {
            // Generate a transaction hash if not present
            const txHash = tx.transactionHash || createTransactionHash(tx, block.index);
            
            // Format the transaction in Etherscan-like format
            formattedTransactions.push({
              transactionHash: txHash,
              blockNumber: block.index,
              blockHash: block.previous_hash,
              from: tx.sender,
              to: tx.recipient,
              value: tx.amount,
              timestamp: tx.timestamp,
              status: true, // Assuming all transactions in the blockchain were successful
              type: tx.type || "Transaction",
              campaignId: tx.campaignId,
              note: tx.notes
            });
          }
        });
      }
    });
    
    // Sort transactions by timestamp (newest first)
    formattedTransactions.sort((a, b) => b.timestamp - a.timestamp);
    
    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error reading blockchain:", error);
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
  
});

// Helper function to create a deterministic transaction hash
function createTransactionHash(tx, blockIndex) {
  const txData = JSON.stringify({
    sender: tx.sender,
    recipient: tx.recipient,
    amount: tx.amount,
    timestamp: tx.timestamp,
    blockIndex
  });
  
  return "0x" + createHash('sha256').update(txData).digest('hex');
}

export default router;
