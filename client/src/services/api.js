import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        useAuthStore.getState().setAuth(
          useAuthStore.getState().user,
          data.accessToken,
          data.refreshToken
        );

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken })
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  getPlaylists: () => api.get('/users/me/playlists'),
  getLikedSongs: () => api.get('/users/me/liked-songs'),
  likeSong: (songId) => api.post(`/users/me/liked-songs/${songId}`),
  unlikeSong: (songId) => api.delete(`/users/me/liked-songs/${songId}`),
  getActivity: () => api.get('/users/me/activity'),
  followArtist: (artistId) => api.post(`/users/follow/artist/${artistId}`),
  unfollowArtist: (artistId) => api.delete(`/users/follow/artist/${artistId}`)
};

export const songAPI = {
  getSongs: (params) => api.get('/songs', { params }),
  getSong: (id) => api.get(`/songs/${id}`),
  getStreamUrl: (id) => api.get(`/songs/${id}/stream`),
  downloadSong: (id) => api.post(`/songs/${id}/download`),
  getRecommendations: () => api.get('/songs/recommendations/for-you')
};

export const playlistAPI = {
  create: (data) => api.post('/playlists', data),
  get: (id) => api.get(`/playlists/${id}`),
  update: (id, data) => api.patch(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (id, songId) => api.post(`/playlists/${id}/songs`, { songId }),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs/${songId}`),
  reorder: (id, songIds) => api.put(`/playlists/${id}/reorder`, { songIds })
};

export const artistAPI = {
  get: (id) => api.get(`/artists/${id}`),
  getAlbums: (id) => api.get(`/artists/${id}/albums`),
  getTopTracks: (id) => api.get(`/artists/${id}/top-tracks`),
  getRelated: (id) => api.get(`/artists/${id}/related`)
};

export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getSuggestions: (query) => api.get('/search/suggestions', { params: { q: query } })
};

export const subscriptionAPI = {
  createCheckoutSession: (tier) => api.post('/subscriptions/create-checkout-session', { tier }),
  cancel: () => api.post('/subscriptions/cancel')
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

export const aiAPI = {
  getRecommendations: () => api.get('/ai/recommendations'),
  getMoodSongs: (mood) => api.get(`/ai/mood/${mood}`),
  getSimilarSongs: (songId) => api.get(`/ai/similar/${songId}`),
  getTrending: (limit = 20) => api.get(`/ai/trending?limit=${limit}`),
  getRadio: (songId, limit = 50) => api.get(`/ai/radio/${songId}?limit=${limit}`)
};

export default api;
