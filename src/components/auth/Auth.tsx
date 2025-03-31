// src/components/auth/Auth.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import spotifyLogo from "../../assets/Spotify_Full_Logo_RGB_White.png";

function Auth() {
  const navigate = useNavigate();
  
  // Function to generate a random string for code verifier
  const generateCodeVerifier = (length: number) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  // Function to generate code challenge from verifier
  const generateCodeChallenge = async (codeVerifier: string) => {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };
  
  // Function to initiate Spotify authorization
  const connectToSpotify = async () => {
    try {
      const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
      
      // Generate and store PKCE code verifier
      const codeVerifier = generateCodeVerifier(128);
      localStorage.setItem('spotify_code_verifier', codeVerifier);
      
      // Generate code challenge from verifier
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Define scopes needed for your app
      const scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public';
      
      // Construct authorization URL with PKCE
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        scope: scope
      });
      
      // Redirect to Spotify authorization page
      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (error) {
      console.error('Authorization error:', error);
    }
  };
  
  useEffect(() => {
    // Check if user is already authenticated
    const accessToken = localStorage.getItem('spotify_access_token');
    if (accessToken) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 rounded-xl bg-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/20">
        <img src={spotifyLogo} alt="Spotify Logo" className="w-36 mx-auto mb-8" />
        <h1 className="text-3xl font-bold text-white mb-4">Connect to Spotify</h1>
        <p className="text-white mb-8">Log in with your Spotify account to organize your music</p>
        <button 
          onClick={connectToSpotify}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-colors duration-300"
        >
          Connect with Spotify
        </button>
      </div>
    </div>
  );
}

export default Auth;