import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB, ObjectId } from '../db/mongodb.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const db = getDB();

    const existing = await db.collection('User').findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('User').insertOne({
      email,
      password: hashedPassword,
      displayName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`,
      role: 'USER',
      subscriptionTier: 'FREE',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const user = await db.collection('User').findOne({ _id: result.insertedId });
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    await db.collection('User').updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    const user = await db.collection('User').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await db.collection('User').updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        subscriptionTier: user.subscriptionTier
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const db = getDB();
    const user = await db.collection('User').findOne({ _id: new ObjectId(decoded.userId) });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id.toString());
    await db.collection('User').updateOne(
      { _id: user._id },
      { $set: { refreshToken: tokens.refreshToken } }
    );

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const db = getDB();
      await db.collection('User').updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { refreshToken: null } }
      );
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
