import express from 'express';
import jwt from 'jsonwebtoken';
import { getDB, ObjectId } from '../db/mongodb.js';
import { authenticate, requirePremium } from '../middleware/auth.js';
import { getProvider } from '../providers/index.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 });

router.get('/', async (req, res) => {
  try {
    const { genre, limit = 50 } = req.query;
    const cacheKey = `songs:${genre || 'all'}:${limit}`;

    let songs = cache.get(cacheKey);
    if (!songs) {
      const provider = getProvider();
      songs = await provider.searchSongs('', { genre, limit: parseInt(limit) });
      cache.set(cacheKey, songs);
    }

    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `song:${id}`;

    let song = cache.get(cacheKey);
    if (!song) {
      const provider = getProvider();
      song = await provider.getSong(id);
      if (song) cache.set(cacheKey, song);
    }

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/stream', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const quality = req.user.subscriptionTier === 'PREMIUM' ? 'high' : 'standard';

    const provider = getProvider();
    const streamData = await provider.getStreamUrl(id, quality);
    if (!streamData) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const db = getDB();
    await db.collection('Activity').insertOne({
      userId: new ObjectId(req.user.id),
      type: 'PLAYED_SONG',
      metadata: { songId: id },
      createdAt: new Date()
    });

    res.json(streamData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/download', authenticate, requirePremium, async (req, res) => {
  try {
    const { id } = req.params;
    const provider = getProvider();
    const song = await provider.getSong(id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const token = jwt.sign({ songId: id, userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const db = getDB();
    await db.collection('Download').updateOne(
      { userId: new ObjectId(req.user.id), songId: id },
      {
        $set: { token, expiresAt, downloadedAt: new Date() },
        $setOnInsert: { userId: new ObjectId(req.user.id), songId: id }
      },
      { upsert: true }
    );

    res.json({ downloadToken: token, expiresAt, song });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optional authentication - works with or without login
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = getDB();
      const user = await db.collection('User').findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          subscriptionTier: user.subscriptionTier
        };
      }
    }
  } catch (error) {
    // Ignore auth errors, continue without user
  }
  next();
};

router.get('/recommendations/for-you', optionalAuth, async (req, res) => {
  try {
    const provider = getProvider();
    const userId = req.user?.id || 'guest';
    const recommendations = await provider.getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
