import crypto from 'crypto';
import { loadData, saveData } from './storage.js';

class Blockchain {
  constructor() {
    const data = loadData() || {};
    this.chain = data.chain || [];
    this.currentTransactions = data.transactions || [];
    this.nodes = new Set();
  
    if (this.chain.length === 0) {
      const genesis = this.newBlock(100, '1');
      this._persist();
    }
  }
  

  registerNode(address) {
    const { host } = new URL(address);
    this.nodes.add(host);
  }

  async resolveConflicts() {
    const axios = await import('axios').then(m => m.default);
    let newChain = null;
    let maxLength = this.chain.length;
  
    console.log("🔁 Starting conflict resolution...");
    console.log("📏 Current chain length:", maxLength);

    console.log("📑 Registered nodes:", Array.from(this.nodes));

  
    for (const node of this.nodes) {
      try {
        const response = await axios.get(`http://${node}/chain`);
        console.log(`🌐 Fetched from ${node} → Response:`, response.data);
  
        const { length, chain } = response.data;
  
        console.log(`🌐 Length: ${length}`);
        console.log(`🌐 Fetched chain:`, chain);
  
        if (length > maxLength) {
          console.log(`✅ Found longer chain from ${node} (${length} > ${maxLength})`);
          maxLength = length;
          newChain = chain;
        }
      } catch (err) {
        console.error(`❌ Error fetching chain from ${node}:`, err.message);
      }
    }
  
    if (newChain) {
      console.log("🔁 Replacing current chain with longer chain");
      this.chain = newChain;
      this._persist();
      return true;
    }
  
    console.log("✅ Current chain is already the longest");
    return false;
  }
  
  
  
  

  // validChain(chain) {
  //   for (let i = 1; i < chain.length; i++) {
  //     const block = chain[i];
  //     const lastBlock = chain[i - 1];
  
  //     if (block.previous_hash !== this.hash(lastBlock)) {
  //       console.log("Hash mismatch at block", i);
  //       return false;
  //     }
  
  //     if (!this.validProof(lastBlock.proof, block.proof)) {
  //       console.log("Invalid proof at block", i);
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  validChain(chain) {
    return true;
  }
  

  newBlock(proof, previousHash = null) {
    const block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof,
      previous_hash: previousHash || this.hash(this.lastBlock),
    };

    this.currentTransactions = [];
    this.chain.push(block);
    this._persist();
    return block;
  }

  newTransaction(sender, recipient, amount) {
    if (!this.currentTransactions) this.currentTransactions = [];
  
    this.currentTransactions.push({ sender, recipient, amount });
    this._persist();
    return this.lastBlock.index + 1;
  }
  

  hash(block) {
    return crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex');
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  proofOfWork(lastProof) {
    return 0; // Always returns 0 since PoW is not used
  }
  
  validProof(lastProof, proof) {
    return true; // Skip validation
  }

  _persist() {
    saveData({ chain: this.chain, transactions: this.currentTransactions });
  }
}

export default Blockchain;
