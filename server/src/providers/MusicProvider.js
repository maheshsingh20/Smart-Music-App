/**
 * Abstract Music Provider Interface
 * Implement this interface to create adapters for different music APIs
 */
export class MusicProvider {
  async searchSongs(query, filters = {}) {
    throw new Error('searchSongs must be implemented');
  }

  async getSong(id) {
    throw new Error('getSong must be implemented');
  }

  async getArtist(id) {
    throw new Error('getArtist must be implemented');
  }

  async getAlbum(id) {
    throw new Error('getAlbum must be implemented');
  }

  async getRecommendations(userId, context = {}) {
    throw new Error('getRecommendations must be implemented');
  }

  async getStreamUrl(songId, quality = 'standard') {
    throw new Error('getStreamUrl must be implemented');
  }
}
