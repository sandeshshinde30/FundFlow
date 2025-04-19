import express from "express";
import Campaign from '../models/campaign.js';
const router = express.Router();

// POST /updateCampaign
router.post("/", async (req, res) => {
  const { campaignId, title, description, target, deadline, image, category } = req.body;

  // 🛡️ Basic Validation
  if (!campaignId) {
    return res.status(400).json({ error: "Campaign ID is required." });
  }

  if (
    !title ||
    !description ||
    !target ||
    !deadline ||
    !image ||
    !category 
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (typeof target !== "number" || target <= 0) {
    return res.status(400).json({ error: "Target must be a positive number." });
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate) || deadlineDate < new Date()) {
    return res.status(400).json({ error: "Deadline must be a valid future date." });
  }

  try {
    // 🕵️ Check if the campaign exists by ID
    const campaign = await Campaign.findOne({ campaignId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    // 🛑 Check if the new target is less than the raised amount
    if (target < campaign.raised) {
      return res.status(400).json({
        error: "Target cannot be less than the raised amount.",
      });
    }

    // 📝 Update the campaign
    campaign.title = title;
    campaign.description = description;
    campaign.target = target;
    campaign.deadline = deadlineDate;
    campaign.image = image;
    campaign.category = category;
  

    // Save the updated campaign to the database
    const updatedCampaign = await campaign.save();

    res.status(200).json({
      message: "Campaign updated successfully.",
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
