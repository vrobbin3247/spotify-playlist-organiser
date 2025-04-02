// src/services/spotifyService.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.spotify.com/v1';
// Use Vite's way of accessing environment variables
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string;

// Refresh access token using refresh token
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
          }
        });
      
      localStorage.setItem('spotify_access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on failure
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      throw error;
    }
  };

// Rest of your code remains the same...
const getAccessToken = () => localStorage.getItem('spotify_access_token');
const getCurrentUserProfile = () => makeSpotifyRequest(`${API_BASE_URL}/me`);

// Generic API request handler with token refresh capability
const makeSpotifyRequest = async (url: string, options: any = {}) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No access token available');
      
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: options.data
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const newTokenData = await refreshAccessToken();
          const retryResponse = await axios({
            url,
            method: options.method || 'GET',
            headers: {
              'Authorization': `Bearer ${newTokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            data: options.data
          });
          return retryResponse.data;
        } catch (refreshError) {
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_refresh_token');
          throw new Error('Authentication failed');
        }
      }
      throw error;
    }
  };

// Get user profile information
export const getUserProfile = async () => {
  return makeSpotifyRequest(`${API_BASE_URL}/me`);
};

// Get user's playlists
export const getUserPlaylists = async () => {
  return makeSpotifyRequest(`${API_BASE_URL}/me/playlists`);
};

// Get playlist details
export const getPlaylistDetails = async (playlistId: string) => {
  return makeSpotifyRequest(`${API_BASE_URL}/playlists/${playlistId}`);
};

// Get playlist tracks
export const getPlaylistTracks = async (playlistId: string) => {
  return makeSpotifyRequest(`${API_BASE_URL}/playlists/${playlistId}/tracks`);
};


export const createPlaylist = async (data: {
    name: string;
    description?: string;
    public?: boolean;
  }) => {
    const user = await getCurrentUserProfile();
    return makeSpotifyRequest(`${API_BASE_URL}/users/${user.id}/playlists`, {
      method: 'POST',
      data: {
        name: data.name,
        description: data.description || '',
        public: data.public || false
      }
    });
  };
  
export const addTracksToPlaylist = async (playlistId: string, trackUris: string[]) => {
  return makeSpotifyRequest(`${API_BASE_URL}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    data: { uris: trackUris }
  });
};