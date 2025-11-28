import express from 'express';
import { getDB, ObjectId } from '../db/mongodb.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;
    const db = getDB();

    const result = await db.collection('Playlist').insertOne({
      name,
      description,
      isPublic,
      userId: new ObjectId(req.user.id),
      cover: 'https://picsum.photos/seed/playlist/300/300',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await db.collection('Activity').insertOne({
      userId: new ObjectId(req.user.id),
      type: 'CREATED_PLAYLIST',
      metadata: { playlistId: result.insertedId.toString() },
      createdAt: new Date()
    });

    const playlist = await db.collection('Playlist').findOne({ _id: result.insertedId });
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const playlist = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.isPublic && (!req.user || playlist.userId.toString() !== req.user.id)) {
      return res.status(403).json({ error: 'Private playlist' });
    }

    // Get playlist songs
    const songs = await db.collection('PlaylistSong')
      .find({ playlistId: new ObjectId(id) })
      .sort({ position: 1 })
      .toArray();

    playlist.songs = songs;
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const db = getDB();

    const playlist = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });
    if (!playlist || playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('Playlist').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, isPublic, updatedAt: new Date() } }
    );

    const updated = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const playlist = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });

    if (!playlist || playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('PlaylistSong').deleteMany({ playlistId: new ObjectId(id) });
    await db.collection('Playlist').deleteOne({ _id: new ObjectId(id) });

    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/songs', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const db = getDB();

    const playlist = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });
    if (!playlist || playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const existing = await db.collection('PlaylistSong').findOne({
      playlistId: new ObjectId(id),
      songId
    });

    if (existing) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    const maxPosition = await db.collection('PlaylistSong')
      .find({ playlistId: new ObjectId(id) })
      .sort({ position: -1 })
      .limit(1)
      .toArray();

    const position = maxPosition.length > 0 ? maxPosition[0].position + 1 : 1;

    await db.collection('PlaylistSong').insertOne({
      playlistId: new ObjectId(id),
      songId,
      position,
      addedAt: new Date()
    });

    res.status(201).json({ message: 'Song added to playlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/songs/:songId', authenticate, async (req, res) => {
  try {
    const { id, songId } = req.params;
    const db = getDB();

    const playlist = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });

    if (!playlist || playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.collection('PlaylistSong').deleteOne({
      playlistId: new ObjectId(id),
      songId
    });

    res.json({ message: 'Song removed from playlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/reorder', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body;
    const db = getDB();

    const playlist = await db.collection('Playlist').findOne({ _id: new ObjectId(id) });
    if (!playlist || playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update positions
    for (let i = 0; i < songIds.length; i++) {
      await db.collection('PlaylistSong').updateOne(
        { playlistId: new ObjectId(id), songId: songIds[i] },
        { $set: { position: i + 1 } }
      );
    }

    res.json({ message: 'Playlist reordered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
