import SpotifyWebApi from 'spotify-web-api-node';
import { MusicProvider } from './MusicProvider.js';

/**
 * Spotify API Provider
 * Uses Spotify Web API for music search and metadata
 * Note: Spotify doesn't provide direct audio streaming URLs for free
 * This provider returns preview URLs (30-second clips) which are free
 */
export class SpotifyProvider extends MusicProvider {
  constructor() {
    super();
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    });
    this.tokenExpirationTime = 0;
  }

  async authenticate() {
    try {
      const now = Date.now();
      if (now < this.tokenExpirationTime) {
        return; // Token still valid
      }

      const data = await this.spotifyApi.clientCredentialsGrant();
      this.spotifyApi.setAccessToken(data.body.access_token);
      this.tokenExpirationTime = now + (data.body.expires_in * 1000) - 60000; // Refresh 1 min before expiry
      console.log('✓ Spotify API authenticated');
    } catch (error) {
      console.error('Spotify authentication error:', error.message);
      throw error;
    }
  }

  async searchSongs(query, filters = {}) {
    await this.authenticate();

    try {
      let searchQuery = query || '*';

      // Add filters to search query
      if (filters.genre) {
        searchQuery += ` genre:${filters.genre.toLowerCase()}`;
      }
      if (filters.artistId) {
        searchQuery += ` artist:${filters.artistId}`;
      }
      if (filters.year) {
        searchQuery += ` year:${filters.year}`;
      }

      const limit = Math.min(parseInt(filters.limit) || 20, 50);
      // Request more results to filter for songs with previews (max 50 for Spotify)
      const searchLimit = Math.min(limit * 2, 50);
      const result = await this.spotifyApi.searchTracks(searchQuery, { limit: searchLimit });

      // Format all tracks
      const allTracks = result.body.tracks.items.map(track => this.formatTrack(track));

      // Prioritize tracks with preview URLs
      const tracksWithPreview = allTracks.filter(t => t.hasPreview);
      const tracksWithoutPreview = allTracks.filter(t => !t.hasPreview);

      // Return tracks with previews first, then others, up to the limit
      return [...tracksWithPreview, ...tracksWithoutPreview].slice(0, limit);
    } catch (error) {
      console.error('Spotify search error:', error.message);
      return [];
    }
  }

  async getSong(id) {
    await this.authenticate();

    try {
      const result = await this.spotifyApi.getTrack(id);
      return this.formatTrack(result.body);
    } catch (error) {
      console.error('Spotify get track error:', error.message);
      return null;
    }
  }

  async getArtist(id) {
    await this.authenticate();

    try {
      const [artist, topTracks, albums] = await Promise.all([
        this.spotifyApi.getArtist(id),
        this.spotifyApi.getArtistTopTracks(id, 'US'),
        this.spotifyApi.getArtistAlbums(id, { limit: 20 })
      ]);

      const relatedArtists = await this.spotifyApi.getArtistRelatedArtists(id);

      return {
        id: artist.body.id,
        name: artist.body.name,
        bio: `${artist.body.name} - ${artist.body.followers.total.toLocaleString()} followers`,
        image: artist.body.images[0]?.url || 'https://via.placeholder.com/400',
        genres: artist.body.genres,
        verified: true,
        topTracks: topTracks.body.tracks.map(track => this.formatTrack(track)),
        albums: albums.body.items.map(album => ({
          id: album.id,
          title: album.name,
          cover: album.images[0]?.url || 'https://via.placeholder.com/300',
          releaseYear: parseInt(album.release_date.split('-')[0]),
          artistId: id
        })),
        relatedArtists: relatedArtists.body.artists.slice(0, 5).map(a => ({
          id: a.id,
          name: a.name,
          image: a.images[0]?.url || 'https://via.placeholder.com/400',
          genres: a.genres
        }))
      };
    } catch (error) {
      console.error('Spotify get artist error:', error.message);
      return null;
    }
  }

  async getAlbum(id) {
    await this.authenticate();

    try {
      const result = await this.spotifyApi.getAlbum(id);
      const album = result.body;

      return {
        id: album.id,
        title: album.name,
        cover: album.images[0]?.url || 'https://via.placeholder.com/300',
        releaseYear: parseInt(album.release_date.split('-')[0]),
        artistId: album.artists[0].id,
        artist: {
          id: album.artists[0].id,
          name: album.artists[0].name
        },
        songs: album.tracks.items.map(track => ({
          id: track.id,
          title: track.name,
          duration: Math.floor(track.duration_ms / 1000),
          audioUrl: track.preview_url || '',
          artistId: track.artists[0].id,
          albumId: id
        }))
      };
    } catch (error) {
      console.error('Spotify get album error:', error.message);
      return null;
    }
  }

  async getRecommendations(userId, context = {}) {
    await this.authenticate();

    try {
      // Get recommendations based on popular tracks
      const result = await this.spotifyApi.getRecommendations({
        seed_genres: ['pop', 'rock', 'hip-hop'],
        limit: 20
      });

      const tracks = result.body.tracks.map(track => this.formatTrack(track));

      return {
        dailyMix: tracks.slice(0, 20),
        discoverWeekly: tracks.slice(0, 20),
        becauseYouListened: tracks.slice(0, 20)
      };
    } catch (error) {
      console.error('Spotify recommendations error:', error.message);
      return {
        dailyMix: [],
        discoverWeekly: [],
        becauseYouListened: []
      };
    }
  }

  async getStreamUrl(songId, quality = 'standard') {
    await this.authenticate();

    try {
      const result = await this.spotifyApi.getTrack(songId);
      const track = result.body;

      // Spotify only provides 30-second preview URLs for free
      // For full playback, you need Spotify Premium and use their SDK
      return {
        url: track.preview_url || '',
        quality: '96kbps', // Preview quality
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        isPreview: true,
        message: 'This is a 30-second preview. Full playback requires Spotify Premium.'
      };
    } catch (error) {
      console.error('Spotify stream URL error:', error.message);
      return null;
    }
  }

  formatTrack(track) {
    // Spotify provides 30-second preview URLs for most tracks
    const previewUrl = track.preview_url || '';

    return {
      id: track.id,
      title: track.name,
      duration: Math.floor(track.duration_ms / 1000),
      audioUrl: previewUrl,
      cover: track.album?.images[0]?.url || 'https://via.placeholder.com/300',
      genre: track.album?.genres?.[0] || 'Unknown',
      mood: this.inferMood(track),
      playCount: track.popularity * 10000,
      artistId: track.artists[0].id,
      artistName: track.artists[0].name,
      albumId: track.album?.id,
      albumName: track.album?.name,
      spotifyUrl: track.external_urls.spotify,
      hasPreview: !!previewUrl,
      previewNote: previewUrl ? '30-second preview' : 'No preview available'
    };
  }

  inferMood(track) {
    // Simple mood inference based on track name
    const name = track.name.toLowerCase();
    if (name.includes('happy') || name.includes('joy')) return 'Happy';
    if (name.includes('sad') || name.includes('blue')) return 'Sad';
    if (name.includes('energy') || name.includes('party')) return 'Energetic';
    if (name.includes('chill') || name.includes('relax')) return 'Chill';
    if (name.includes('love') || name.includes('heart')) return 'Romantic';
    return 'Neutral';
  }
}
