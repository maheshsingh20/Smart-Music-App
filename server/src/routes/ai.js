import express from 'express';
import jwt from 'jsonwebtoken';
import { getDB, ObjectId } from '../db/mongodb.js';
import { aiService } from '../services/aiRecommendations.js';

const router = express.Router();

// Optional authentication middleware
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
    // Continue without user
  }
  next();
};

// Get personalized AI recommendations
router.get('/recommendations', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const recommendations = await aiService.getPersonalizedRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mood-based recommendations
router.get('/mood/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const songs = await aiService.getMoodBasedRecommendations(mood);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get similar songs
router.get('/similar/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    const similar = await aiService.getSimilarSongs(songId);
    res.json(similar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending songs
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const trending = await aiService.getTrendingSongs(parseInt(limit));
    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI radio station
router.get('/radio/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    const { limit = 50 } = req.query;
    const radio = await aiService.getRadioStation(songId, parseInt(limit));
    res.json(radio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
