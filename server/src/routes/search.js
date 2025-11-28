import express from 'express';
import { getProvider } from '../providers/index.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 180 });

router.get('/', async (req, res) => {
  try {
    const { q, genre, year, mood, artistId, limit = 50 } = req.query;

    if (!q && !genre && !year && !mood && !artistId) {
      return res.status(400).json({ error: 'At least one search parameter required' });
    }

    const cacheKey = `search:${JSON.stringify(req.query)}`;
    let results = cache.get(cacheKey);

    if (!results) {
      const provider = getProvider();
      const filters = { genre, year, mood, artistId, limit: parseInt(limit) };
      results = await provider.searchSongs(q || '', filters);
      cache.set(cacheKey, results);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const cacheKey = `suggestions:${q}`;
    let suggestions = cache.get(cacheKey);

    if (!suggestions) {
      const provider = getProvider();
      const songs = await provider.searchSongs(q, { limit: 5 });
      suggestions = songs.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artistName || song.artistId,
        type: 'song'
      }));
      cache.set(cacheKey, suggestions);
    }

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
