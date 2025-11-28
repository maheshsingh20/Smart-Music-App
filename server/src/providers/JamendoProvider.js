import axios from 'axios';
import { MusicProvider } from './MusicProvider.js';

/**
 * Jamendo API Provider
 * Free music streaming with full playback (no 30-second limit!)
 * Jamendo provides royalty-free music from independent artists
 * 
 * Get your free API key at: https://devportal.jamendo.com/
 */
export class JamendoProvider extends MusicProvider {
  constructor() {
    super();
    this.clientId = process.env.JAMENDO_CLIENT_ID;
    this.baseUrl = 'https://api.jamendo.com/v3.0';
    this.audioFormat = 'mp32'; // mp31 (96kbps), mp32 (VBR ~192kbps), ogg, flac
  }

  async searchSongs(query, filters = {}) {
    try {
      const params = {
        client_id: this.clientId,
        format: 'json',
        limit: Math.min(parseInt(filters.limit) || 20, 50),
        search: query || '',
        audioformat: this.audioFormat,
        include: 'musicinfo'
      };

      // Add filters
      if (filters.genre) {
        params.tags = filters.genre.toLowerCase();
      }

      const response = await axios.get(`${this.baseUrl}/tracks`, { params });

      return response.data.results.map(track => this.formatTrack(track));
    } catch (error) {
      console.error('Jamendo search error:', error.message);
      return [];
    }
  }

  async getSong(id) {
    try {
      const params = {
        client_id: this.clientId,
        format: 'json',
        id: id,
        audioformat: this.audioFormat,
        include: 'musicinfo'
      };

      const response = await axios.get(`${this.baseUrl}/tracks`, { params });

      if (response.data.results.length > 0) {
        return this.formatTrack(response.data.results[0]);
      }
      return null;
    } catch (error) {
      console.error('Jamendo get track error:', error.message);
      return null;
    }
  }

  async getArtist(id) {
    try {
      // Get artist info
      const artistParams = {
        client_id: this.clientId,
        format: 'json',
        id: id
      };

      const artistResponse = await axios.get(`${this.baseUrl}/artists`, { params: artistParams });

      if (artistResponse.data.results.length === 0) {
        return null;
      }

      const artist = artistResponse.data.results[0];

      // Get artist's tracks
      const tracksParams = {
        client_id: this.clientId,
        format: 'json',
        artist_id: id,
        limit: 20,
        audioformat: this.audioFormat,
        order: 'popularity_total'
      };

      const tracksResponse = await axios.get(`${this.baseUrl}/tracks`, { params: tracksParams });

      // Get artist's albums
      const albumsParams = {
        client_id: this.clientId,
        format: 'json',
        artist_id: id,
        limit: 20
      };

      const albumsResponse = await axios.get(`${this.baseUrl}/albums`, { params: albumsParams });

      return {
        id: artist.id,
        name: artist.name,
        bio: artist.bio || `${artist.name} - Independent artist on Jamendo`,
        image: artist.image || 'https://via.placeholder.com/400',
        genres: artist.musicinfo?.tags?.genres || [],
        verified: true,
        topTracks: tracksResponse.data.results.map(track => this.formatTrack(track)),
        albums: albumsResponse.data.results.map(album => ({
          id: album.id,
          title: album.name,
          cover: album.image || 'https://via.placeholder.com/300',
          releaseYear: new Date(album.releasedate).getFullYear(),
          artistId: id
        })),
        relatedArtists: [] // Jamendo doesn't provide related artists
      };
    } catch (error) {
      console.error('Jamendo get artist error:', error.message);
      return null;
    }
  }

  async getAlbum(id) {
    try {
      const albumParams = {
        client_id: this.clientId,
        format: 'json',
        id: id
      };

      const albumResponse = await axios.get(`${this.baseUrl}/albums`, { params: albumParams });

      if (albumResponse.data.results.length === 0) {
        return null;
      }

      const album = albumResponse.data.results[0];

      // Get album tracks
      const tracksParams = {
        client_id: this.clientId,
        format: 'json',
        album_id: id,
        audioformat: this.audioFormat
      };

      const tracksResponse = await axios.get(`${this.baseUrl}/tracks`, { params: tracksParams });

      return {
        id: album.id,
        title: album.name,
        cover: album.image || 'https://via.placeholder.com/300',
        releaseYear: new Date(album.releasedate).getFullYear(),
        artistId: album.artist_id,
        artist: {
          id: album.artist_id,
          name: album.artist_name
        },
        songs: tracksResponse.data.results.map(track => this.formatTrack(track))
      };
    } catch (error) {
      console.error('Jamendo get album error:', error.message);
      return null;
    }
  }

  async getRecommendations(userId, context = {}) {
    try {
      // Get popular tracks for different categories
      const [popular, electronic, rock] = await Promise.all([
        this.getTracks({ order: 'popularity_week', limit: 20 }),
        this.getTracks({ tags: 'electronic', order: 'popularity_week', limit: 20 }),
        this.getTracks({ tags: 'rock', order: 'popularity_week', limit: 20 })
      ]);

      return {
        dailyMix: popular,
        discoverWeekly: electronic,
        becauseYouListened: rock
      };
    } catch (error) {
      console.error('Jamendo recommendations error:', error.message);
      return {
        dailyMix: [],
        discoverWeekly: [],
        becauseYouListened: []
      };
    }
  }

  async getTracks(params) {
    try {
      const response = await axios.get(`${this.baseUrl}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          audioformat: this.audioFormat,
          ...params
        }
      });
      return response.data.results.map(track => this.formatTrack(track));
    } catch (error) {
      return [];
    }
  }

  async getStreamUrl(songId, quality = 'standard') {
    try {
      const song = await this.getSong(songId);
      if (!song) return null;

      // Jamendo provides full streaming URLs!
      return {
        url: song.audioUrl,
        quality: quality === 'high' ? '192kbps VBR' : '192kbps VBR',
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours
        isPreview: false,
        message: 'Full song playback available!'
      };
    } catch (error) {
      console.error('Jamendo stream URL error:', error.message);
      return null;
    }
  }

  formatTrack(track) {
    return {
      id: track.id,
      title: track.name,
      duration: track.duration || 0,
      audioUrl: track.audio || track.audiodownload || '',
      cover: track.image || track.album_image || 'https://via.placeholder.com/300',
      genre: track.musicinfo?.tags?.genres?.[0] || 'Unknown',
      mood: track.musicinfo?.tags?.vartags?.[0] || 'Neutral',
      playCount: track.stats?.rate || 0,
      artistId: track.artist_id,
      artistName: track.artist_name,
      albumId: track.album_id,
      albumName: track.album_name,
      jamendoUrl: track.shareurl,
      license: track.license_ccurl,
      hasPreview: false, // Full song, not preview!
      isFullSong: true
    };
  }
}
