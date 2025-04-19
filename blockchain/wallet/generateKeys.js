import crypto from 'crypto';
import fs from 'fs';

export function generateWalletKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  // Create wallet address from public key hash (simplified)
  const pubKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex');
  const walletAddress = '0x' + pubKeyHash.slice(0, 64);

  return {
    walletAddress,
    publicKey,
    privateKey
  };
}
