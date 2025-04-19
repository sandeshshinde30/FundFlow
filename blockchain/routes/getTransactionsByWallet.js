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
    return res.status(400).json({ 
      success: false,
      message: "Wallet address is required" 
    });
  }

  try {
    // Normalize wallet address for comparison (lowercase, trim)
    const normalizedWallet = walletAddress.toLowerCase().trim();
    
    // Read blockchain data
    const data = fs.readFileSync(blockchainPath);
    const blockchainData = JSON.parse(data);
    const blockchain = blockchainData.chain;
    
    const formattedTransactions = [];
    
    // Process each block in the blockchain
    blockchain.forEach((block) => {
      if (block.transactions && Array.isArray(block.transactions)) {
        block.transactions.forEach((txObj) => {
          // Check if it's the newer format or older format
          const tx = txObj.sender || txObj; // Handle both formats
          
          // Check sender/recipient against normalized wallet address
          const sender = tx.sender ? tx.sender.toLowerCase().trim() : '';
          const recipient = tx.recipient ? tx.recipient.toLowerCase().trim() : '';
          
          // Only include transactions for the requested wallet
          if (sender === normalizedWallet || recipient === normalizedWallet) {
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
    
    return res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error retrieving transactions by wallet:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to retrieve transactions" 
    });
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