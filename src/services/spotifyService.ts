// src/services/spotifyService.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.spotify.com/v1';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

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
        client_id: CLIENT_ID
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    
    localStorage.setItem('spotify_access_token', response.data.access_token);
    
    // Update the refresh token if a new one was provided
    if (response.data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Get user profile information
export const getUserProfile = async () => {
  try {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Try to refresh the token
      try {
        const newTokenData = await refreshAccessToken();
        // Retry the request with the new token
        const retryResponse = await axios.get(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${newTokenData.access_token}`
          }
        });
        return retryResponse.data;
      } catch (refreshError) {
        // If refresh fails, clear tokens and throw error
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        throw new Error('Authentication failed');
      }
    }
    throw error;
  }
};

// Get user's playlists
export const getUserPlaylists = async () => {
  try {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/me/playlists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Try to refresh the token
      try {
        const newTokenData = await refreshAccessToken();
        // Retry the request with the new token
        const retryResponse = await axios.get(`${API_BASE_URL}/me/playlists`, {
          headers: {
            'Authorization': `Bearer ${newTokenData.access_token}`
          }
        });
        return retryResponse.data;
      } catch (refreshError) {
        // If refresh fails, clear tokens and throw error
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        throw new Error('Authentication failed');
      }
    }
    throw error;
  }
};

export const getPlaylistDetails = async (playlistId: string) => {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      throw error;
    }
  };
  
  export const getPlaylistTracks = async (playlistId: string) => {
    const accessToken = localStorage.getItem('spotify_access_token');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    try {
      const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  };