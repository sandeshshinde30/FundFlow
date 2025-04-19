import crypto from 'crypto';
import fs from 'fs';

const privateKey = fs.readFileSync('private.pem', 'utf8');

const transaction = {
  from: '0x035288b84646c5e65087c6927091d6331ae009c9b32082adbb6e7e391670066a',
  to: '0xFundraiserWallet456',
  amount: 250,
  timestamp: 1683838383 // <--- Fixed timestamp for reproducibility
};

// Save this transaction to a file to use later
fs.writeFileSync('transaction.json', JSON.stringify(transaction, null, 2));

const sign = crypto.createSign('SHA256');
sign.update(JSON.stringify(transaction));
sign.end();

const signature = sign.sign(privateKey, 'hex');
console.log('🖋️ Signature:', signature);

// Save signature to a file too
fs.writeFileSync('signature.txt', signature);
