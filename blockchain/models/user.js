// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  password : String,
  email : String,
  balance : Number,
  walletAddress: String,
  totalCampaigns : Number,
  totalFundsRaised : Number,
  totalTransactions : Number,
  publicKey: String,
  privateKey: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;
