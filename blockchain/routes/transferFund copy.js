import express from "express";
import User from "../models/user.js";
import Transaction from "../models/transaction.js"; // ✅ Import Transaction model

const router = express.Router();

router.post("/", async (req, res) => {
  const { sender, receiver, amount, note } = req.body;

  if (!sender || !receiver || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction details",
    });
  }

  try {
    const senderUser = await User.findOne({ walletAddress: sender });
    const receiverUser = await User.findOne({ walletAddress: receiver });

    if (!senderUser) {
      return res.status(404).json({
        success: false,
        message: "Sender wallet not found",
      });
    }

    if (senderUser.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver wallet not found",
      });
    }

    // Update balances
    senderUser.balance -= amount;
    receiverUser.balance += amount;

    // Save both users
    await senderUser.save();
    await receiverUser.save();

    // ✅ Save the transaction to DB
    const newTransaction = new Transaction({
      sender,
      receiver,
      amount,
      note,
    });

    await newTransaction.save();

    console.log(`Transaction saved. Note: ${note || "No note"}`);

    return res.status(200).json({
      success: true,
      message: `Transferred ₹${amount} from ${sender} to ${receiver}`,
      senderBalance: senderUser.balance.toFixed(2),
      receiverBalance: receiverUser.balance.toFixed(2),
    });
  } catch (err) {
    console.error("Transaction failed:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during the transaction",
    });
  }
});

export default router;
