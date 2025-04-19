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
  const { transactionHash } = req.body;

  if (!transactionHash) {
    return res.status(400).json({ 
      success: false,
      message: "Transaction hash is required" 
    });
  }

  try {
    // Normalize transaction hash for comparison (lowercase, trim)
    const normalizedHash = transactionHash.toLowerCase().trim();
    
    // Read blockchain data
    const data = fs.readFileSync(blockchainPath);
    const blockchainData = JSON.parse(data);
    const blockchain = blockchainData.chain;
    
    let foundTransaction = null;
    
    // Search through all blocks for the transaction hash
    for (const block of blockchain) {
      if (block.transactions && Array.isArray(block.transactions)) {
        for (const txObj of block.transactions) {
          // Check different transaction formats
          const tx = txObj.sender || txObj;
          
          // Generate a hash to compare if not present
          const txHash = tx.transactionHash || createTransactionHash(tx, block.index);
          const normalizedTxHash = txHash.toLowerCase().trim();
          
          if (normalizedTxHash === normalizedHash) {
            // Found the transaction - format it and return
            foundTransaction = {
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
            };
            break;
          }
        }
      }
      
      if (foundTransaction) break;
    }
    
    if (foundTransaction) {
      return res.status(200).json(foundTransaction);
    } else {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found" 
      });
    }
  } catch (error) {
    console.error("Error retrieving transaction by hash:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to retrieve transaction" 
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