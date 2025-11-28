import express from 'express';
import { getProvider } from '../providers/index.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 600 });

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `artist:${id}`;

    let artist = cache.get(cacheKey);
    if (!artist) {
      const provider = getProvider();
      artist = await provider.getArtist(id);
      if (artist) cache.set(cacheKey, artist);
    }

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(artist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = getProvider();
    const artist = await provider.getArtist(id);

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(artist.albums || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/top-tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = getProvider();
    const artist = await provider.getArtist(id);

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(artist.topTracks || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const provider = getProvider();
    const artist = await provider.getArtist(id);

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json(artist.relatedArtists || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
