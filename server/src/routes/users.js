import express from 'express';
import { getDB, ObjectId } from '../db/mongodb.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('User').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0, refreshToken: 0 } }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const db = getDB();

    await db.collection('User').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { displayName, avatar, updatedAt: new Date() } }
    );

    const user = await db.collection('User').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0, refreshToken: 0 } }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me/playlists', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const playlists = await db.collection('Playlist')
      .find({ userId: new ObjectId(req.user.id) })
      .toArray();
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me/liked-songs', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const likedSongs = await db.collection('LikedSong')
      .find({ userId: new ObjectId(req.user.id) })
      .sort({ likedAt: -1 })
      .toArray();

    // Fetch full song details from provider
    const { getProvider } = await import('../providers/index.js');
    const provider = getProvider();

    const songsWithDetails = await Promise.all(
      likedSongs.map(async (liked) => {
        try {
          const song = await provider.getSong(liked.songId);
          return song ? { ...song, likedAt: liked.likedAt } : null;
        } catch (error) {
          console.error(`Failed to fetch song ${liked.songId}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (songs that couldn't be fetched)
    const validSongs = songsWithDetails.filter(song => song !== null);

    res.json(validSongs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/me/liked-songs/:songId', authenticate, async (req, res) => {
  try {
    const { songId } = req.params;
    const db = getDB();

    const existing = await db.collection('LikedSong').findOne({
      userId: new ObjectId(req.user.id),
      songId
    });

    if (existing) {
      return res.status(400).json({ error: 'Song already liked' });
    }

    await db.collection('LikedSong').insertOne({
      userId: new ObjectId(req.user.id),
      songId,
      likedAt: new Date()
    });

    await db.collection('Activity').insertOne({
      userId: new ObjectId(req.user.id),
      type: 'LIKED_SONG',
      metadata: { songId },
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Song liked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/me/liked-songs/:songId', authenticate, async (req, res) => {
  try {
    const { songId } = req.params;
    const db = getDB();

    await db.collection('LikedSong').deleteOne({
      userId: new ObjectId(req.user.id),
      songId
    });

    res.json({ message: 'Song unliked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me/activity', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const activities = await db.collection('Activity')
      .find({ userId: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/follow/artist/:artistId', authenticate, async (req, res) => {
  try {
    const { artistId } = req.params;
    const db = getDB();

    const existing = await db.collection('Follow').findOne({
      followerId: new ObjectId(req.user.id),
      artistId
    });

    if (existing) {
      return res.status(400).json({ error: 'Already following' });
    }

    await db.collection('Follow').insertOne({
      followerId: new ObjectId(req.user.id),
      artistId,
      followedAt: new Date()
    });

    await db.collection('Activity').insertOne({
      userId: new ObjectId(req.user.id),
      type: 'FOLLOWED_ARTIST',
      metadata: { artistId },
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Artist followed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/follow/artist/:artistId', authenticate, async (req, res) => {
  try {
    const { artistId } = req.params;
    const db = getDB();

    await db.collection('Follow').deleteOne({
      followerId: new ObjectId(req.user.id),
      artistId
    });

    res.json({ message: 'Unfollowed artist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
