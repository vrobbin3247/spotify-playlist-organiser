// src/components/auth/Callback.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getTokenFromCode = async () => {
      // Get the authorization code from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem('spotify_auth_state');
      
      // Verify state to prevent CSRF attacks
      if (!state || state !== storedState) {
        setError('State mismatch. Authentication failed.');
        return;
      }

      if (code) {
        try {
          // In a real app, you would exchange the code for an access token
          // with your backend server. For security reasons, you shouldn't
          // expose your client secret in the frontend.
          
          // For demo purposes, we'll just save the code and navigate to dashboard
          localStorage.setItem('spotify_auth_code', code);
          localStorage.removeItem('spotify_auth_state');
          navigate('/dashboard');
        } catch (err) {
          console.error('Error getting access token:', err);
          setError('Failed to authenticate with Spotify.');
        }
      } else if (urlParams.get('error')) {
        setError(`Authorization failed: ${urlParams.get('error')}`);
      }
    };

    getTokenFromCode();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center ">
        <div className="text-white text-center p-8 rounded-xl bg-white/10 backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center ">
      <div className="text-white text-center p-8 rounded-xl bg-white/10 backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}

export default Callback;