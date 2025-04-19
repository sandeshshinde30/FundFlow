// models/Campaign.js
import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  target: { type: Number, required: true },
  raised: { type: Number, required: true },
  deadline: { type: Date, required: true },
  image: { type: String, required: true },
  campaignId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
