// wallet.js
import crypto from 'crypto';
import fs from 'fs';

// Generate key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1', // used by Bitcoin, Ethereum, etc.
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Save to files (or store securely)
fs.writeFileSync('private.pem', privateKey);
fs.writeFileSync('public.pem', publicKey);

console.log('✅ Wallet keys generated!');
