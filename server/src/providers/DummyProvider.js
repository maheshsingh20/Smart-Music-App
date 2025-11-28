import { MusicProvider } from './MusicProvider.js';

/**
 * Dummy provider for development and testing
 * Returns mock data without external API calls
 */
export class DummyProvider extends MusicProvider {
  constructor() {
    super();
    this.mockData = this.generateMockData();
  }

  generateMockData() {
    const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical'];
    const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic'];

    const artists = Array.from({ length: 20 }, (_, i) => ({
      id: `artist-${i + 1}`,
      name: `Artist ${i + 1}`,
      bio: `Biography of Artist ${i + 1}`,
      image: `https://picsum.photos/seed/artist${i}/400/400`,
      genres: [genres[i % genres.length]],
      verified: i < 10
    }));

    const albums = Array.from({ length: 30 }, (_, i) => ({
      id: `album-${i + 1}`,
      title: `Album ${i + 1}`,
      cover: `https://picsum.photos/seed/album${i}/300/300`,
      releaseYear: 2020 + (i % 4),
      artistId: artists[i % artists.length].id
    }));

    const songs = Array.from({ length: 100 }, (_, i) => ({
      id: `song-${i + 1}`,
      title: `Song ${i + 1}`,
      duration: 180 + (i % 120),
      audioUrl: `https://example.com/audio/song-${i + 1}.mp3`,
      cover: albums[i % albums.length].cover,
      genre: genres[i % genres.length],
      mood: moods[i % moods.length],
      playCount: Math.floor(Math.random() * 1000000),
      artistId: artists[i % artists.length].id,
      albumId: albums[i % albums.length].id
    }));

    return { artists, albums, songs };
  }

  async searchSongs(query, filters = {}) {
    let results = this.mockData.songs;

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(song =>
        song.title.toLowerCase().includes(lowerQuery)
      );
    }

    if (filters.genre) {
      results = results.filter(song => song.genre === filters.genre);
    }

    if (filters.artistId) {
      results = results.filter(song => song.artistId === filters.artistId);
    }

    if (filters.year) {
      const album = this.mockData.albums.find(a => a.releaseYear === parseInt(filters.year));
      if (album) {
        results = results.filter(song => song.albumId === album.id);
      }
    }

    if (filters.mood) {
      results = results.filter(song => song.mood === filters.mood);
    }

    return results.slice(0, 50);
  }

  async getSong(id) {
    return this.mockData.songs.find(s => s.id === id) || null;
  }

  async getArtist(id) {
    const artist = this.mockData.artists.find(a => a.id === id);
    if (!artist) return null;

    const songs = this.mockData.songs.filter(s => s.artistId === id);
    const albums = this.mockData.albums.filter(a => a.artistId === id);

    return {
      ...artist,
      topTracks: songs.sort((a, b) => b.playCount - a.playCount).slice(0, 10),
      albums,
      relatedArtists: this.mockData.artists
        .filter(a => a.id !== id && a.genres.some(g => artist.genres.includes(g)))
        .slice(0, 5)
    };
  }

  async getAlbum(id) {
    const album = this.mockData.albums.find(a => a.id === id);
    if (!album) return null;

    const songs = this.mockData.songs.filter(s => s.albumId === id);
    const artist = this.mockData.artists.find(a => a.id === album.artistId);

    return { ...album, songs, artist };
  }

  async getRecommendations(userId, context = {}) {
    const shuffled = [...this.mockData.songs].sort(() => Math.random() - 0.5);

    return {
      dailyMix: shuffled.slice(0, 20),
      discoverWeekly: shuffled.slice(20, 40),
      becauseYouListened: shuffled.slice(40, 60)
    };
  }

  async getStreamUrl(songId, quality = 'standard') {
    const song = await this.getSong(songId);
    if (!song) return null;

    const qualityMap = {
      low: '128kbps',
      standard: '192kbps',
      high: '320kbps'
    };

    return {
      url: song.audioUrl,
      quality: qualityMap[quality] || qualityMap.standard,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  }
}
