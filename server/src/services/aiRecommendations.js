import { getDB, ObjectId } from '../db/mongodb.js';
import { getProvider } from '../providers/index.js';

/**
 * AI-powered music recommendations
 * Uses listening history, liked songs, and collaborative filtering
 */

export class AIRecommendationService {

  /**
   * Get personalized recommendations based on user's listening history
   */
  async getPersonalizedRecommendations(userId) {
    const db = getDB();
    const provider = getProvider();

    try {
      // If guest user, return generic recommendations
      if (userId === 'guest' || !userId) {
        const songs = await provider.searchSongs('', { limit: 30 });
        return {
          dailyMix: songs.slice(0, 10),
          discoverWeekly: songs.slice(10, 20),
          becauseYouListened: songs.slice(20, 30)
        };
      }

      // Get user's listening history
      const recentPlays = await db.collection('Activity')
        .find({
          userId: new ObjectId(userId),
          type: 'PLAYED_SONG'
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      // Get user's liked songs
      const likedSongs = await db.collection('LikedSong')
        .find({ userId: new ObjectId(userId) })
        .sort({ likedAt: -1 })
        .limit(20)
        .toArray();

      // Extract genres and moods from history
      const songIds = [...new Set([
        ...recentPlays.map(p => p.metadata.songId),
        ...likedSongs.map(l => l.songId)
      ])];

      // If user has no history, return generic recommendations
      if (songIds.length === 0) {
        const songs = await provider.searchSongs('', { limit: 30 });
        return {
          dailyMix: songs.slice(0, 10),
          discoverWeekly: songs.slice(10, 20),
          becauseYouListened: songs.slice(20, 30)
        };
      }

      // Get recommendations based on listening patterns
      const recommendations = await provider.getRecommendations(userId, {
        recentSongs: songIds.slice(0, 5)
      });

      return recommendations;
    } catch (error) {
      console.error('AI recommendations error:', error);
      // Return generic recommendations on error
      try {
        const songs = await provider.searchSongs('', { limit: 30 });
        return {
          dailyMix: songs.slice(0, 10),
          discoverWeekly: songs.slice(10, 20),
          becauseYouListened: songs.slice(20, 30)
        };
      } catch (fallbackError) {
        return {
          dailyMix: [],
          discoverWeekly: [],
          becauseYouListened: []
        };
      }
    }
  }

  /**
   * Get mood-based recommendations
   */
  async getMoodBasedRecommendations(mood) {
    const provider = getProvider();

    const moodToGenre = {
      happy: 'pop',
      sad: 'acoustic',
      energetic: 'electronic',
      chill: 'ambient',
      romantic: 'jazz',
      focus: 'classical',
      workout: 'rock',
      party: 'dance'
    };

    const genre = moodToGenre[mood.toLowerCase()] || 'pop';

    try {
      const songs = await provider.searchSongs('', {
        genre,
        limit: 30
      });

      return songs;
    } catch (error) {
      console.error('Mood recommendations error:', error);
      return [];
    }
  }

  /**
   * Get similar songs based on a seed song
   */
  async getSimilarSongs(songId) {
    const provider = getProvider();

    try {
      const song = await provider.getSong(songId);
      if (!song) return [];

      // Search for songs with similar genre
      const similar = await provider.searchSongs('', {
        genre: song.genre,
        limit: 20
      });

      // Filter out the seed song
      return similar.filter(s => s.id !== songId);
    } catch (error) {
      console.error('Similar songs error:', error);
      return [];
    }
  }

  /**
   * Get trending songs based on play counts
   */
  async getTrendingSongs(limit = 20) {
    const db = getDB();

    try {
      // Get most played songs from last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const trending = await db.collection('Activity')
        .aggregate([
          {
            $match: {
              type: 'PLAYED_SONG',
              createdAt: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: '$metadata.songId',
              playCount: { $sum: 1 }
            }
          },
          {
            $sort: { playCount: -1 }
          },
          {
            $limit: limit
          }
        ])
        .toArray();

      // Get song details from provider
      const provider = getProvider();
      const songs = await Promise.all(
        trending.map(t => provider.getSong(t._id))
      );

      return songs.filter(s => s !== null);
    } catch (error) {
      console.error('Trending songs error:', error);
      // Fallback to provider's popular songs
      const provider = getProvider();
      return provider.searchSongs('', { limit });
    }
  }

  /**
   * Get AI-powered "Radio" - continuous similar songs
   */
  async getRadioStation(seedSongId, limit = 50) {
    const provider = getProvider();

    try {
      const seedSong = await provider.getSong(seedSongId);
      if (!seedSong) return [];

      // Get songs with same genre
      const similar = await provider.searchSongs('', {
        genre: seedSong.genre,
        limit
      });

      // Shuffle for variety
      return similar.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Radio station error:', error);
      return [];
    }
  }
}

export const aiService = new AIRecommendationService();
