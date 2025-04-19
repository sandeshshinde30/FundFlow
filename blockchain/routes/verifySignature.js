import crypto from 'crypto';
import fs from 'fs';

const publicKey = fs.readFileSync('public.pem', 'utf8');
const transaction = JSON.parse(fs.readFileSync('transaction.json', 'utf8'));
const signature = fs.readFileSync('signature.txt', 'utf8');

const verify = crypto.createVerify('SHA256');
verify.update(JSON.stringify(transaction));
verify.end();

const isValid = verify.verify(publicKey, signature, 'hex');
console.log('✅ Signature Valid?', isValid);
