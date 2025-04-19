// routes/login.js
import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }



    return res.status(200).json({
      message: 'Login successful!',
      user: {
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress,
        publicKey: user.publicKey,
        privateKey: user.privateKey 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;
