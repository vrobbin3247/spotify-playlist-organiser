// src/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const authCode = localStorage.getItem('spotify_auth_code');
    if (!authCode) {
      navigate('/');
      return;
    }
    setIsAuthenticated(true);
    
    // In a real app, you would use the authCode to get user profile
    // and handle token refresh logic
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('spotify_auth_code');
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen min-w-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Spotify Organizer</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-white">
          <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
          <p>You're successfully authenticated with Spotify!</p>
          <p className="mt-4">This is where you would display playlists and provide organization features.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;