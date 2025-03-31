// src/components/auth/Callback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Callback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        // Get code from URL and code verifier from storage
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          throw new Error(`Authorization error: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code found in URL');
        }
        
        const codeVerifier = localStorage.getItem('spotify_code_verifier');
        if (!codeVerifier) {
          throw new Error('No code verifier found. Please try logging in again.');
        }
        
        // Exchange code for token using PKCE
        const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
        
        const response = await axios.post('https://accounts.spotify.com/api/token',
          new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier
          }), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // Store tokens in localStorage
        localStorage.setItem('spotify_access_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', response.data.refresh_token);
        }
        
        // Clean up code verifier
        localStorage.removeItem('spotify_code_verifier');
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Token exchange error:', error);
        if (axios.isAxiosError(error) && error.response?.data) {
          setError(`Authentication failed: ${error.response.data.error_description || error.response.data.error}`);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred during authentication.');
        }
      }
    };
    
    exchangeCodeForToken();
  }, [navigate]);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white/10 backdrop-blur-md rounded-xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white/10 backdrop-blur-md rounded-xl text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Connecting to Spotify</h2>
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
        <p className="text-white">Please wait while we complete the authentication...</p>
      </div>
    </div>
  );
}

export default Callback;