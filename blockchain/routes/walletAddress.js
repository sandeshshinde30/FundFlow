// address.js
import crypto from 'crypto';
import fs from 'fs';

const publicKey = fs.readFileSync('public.pem', 'utf8');
const address = crypto.createHash('sha256').update(publicKey).digest('hex');

console.log('🏦 Your Wallet Address:', address);
