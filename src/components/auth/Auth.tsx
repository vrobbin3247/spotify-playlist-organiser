// src/components/auth/Auth.tsx
import { useEffect } from 'react';

function Auth() {
  useEffect(() => {
    // Generate a random string for state verification
    const generateRandomString = (length: number) => {
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const values = crypto.getRandomValues(new Uint8Array(length));
      return Array.from(values)
        .map(x => possible[x % possible.length])
        .join('');
    };
    
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);
    
    // Define the scopes you need
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
    
    // Build the authorization URL
    const args = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      state: state
    });
    
    // Redirect to Spotify authorization page
    window.location.href = 'https://accounts.spotify.com/authorize?' + args;
  }, []);
  
  return (
    <div className="flex items-center justify-center h">
      <div className="text-white text-center p-8 rounded-xl bg-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4">Redirecting to Spotify...</h2>
        <p>Please wait while we connect to your Spotify account.</p>
      </div>
    </div>
  );
}

export default Auth;