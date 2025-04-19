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
  
    for (const node of this.nodes) {
      try {
        console.log("Fetching chain from node:", node);
  
        const response = await axios.get(`http://${node}/chain`);
        const { length, chain } = response.data;
  
        console.log("Received length:", length);
        console.log("Is valid chain?", this.validChain(chain));
  
        if (length > maxLength && this.validChain(chain)) {
          maxLength = length;
          newChain = chain;
        }
      } catch (err) {
        console.error(`Error fetching chain from ${node}:`, err.message);
      }
    }
  
    if (newChain) {
      this.chain = newChain;
      this._persist();
      return true;
    }
  
    return false;
  }
  

  validChain(chain) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
  
      if (block.previous_hash !== this.hash(lastBlock)) {
        console.log("Hash mismatch at block", i);
        return false;
      }
  
      if (!this.validProof(lastBlock.proof, block.proof)) {
        console.log("Invalid proof at block", i);
        return false;
      }
    }
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
    let proof = 0;
    while (!this.validProof(lastProof, proof)) proof++;
    return proof;
  }

  validProof(lastProof, proof) {
    const guess = `${lastProof}${proof}`;
    const guessHash = crypto.createHash('sha256').update(guess).digest('hex');
    return guessHash.startsWith('0000');
  }

  _persist() {
    saveData({ chain: this.chain, transactions: this.currentTransactions });
  }
}

export default Blockchain;
