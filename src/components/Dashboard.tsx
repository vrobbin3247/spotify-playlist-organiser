// src/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getUserPlaylists } from '../services/spotifyService';
import spotifyLogo from "../assets/Spotify_Primary_Logo_RGB_White.png";
import PlaylistCard from './PlayListCards';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Check if we have an access token
        const accessToken = localStorage.getItem('spotify_access_token');
        if (!accessToken) {
          navigate('/auth');
          return;
        }
        
        // Fetch user profile and playlists
        const userProfile = await getUserProfile();
        setUser(userProfile);
        
        const playlistsData = await getUserPlaylists();
        setPlaylists(playlistsData.items || []);
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load dashboard data');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    navigate('/');
  };
  
  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    // You could navigate to a playlist detail page:
    // navigate(`/playlist/${playlistId}`);
    console.log(`Playlist selected: ${playlistId}`);
    navigate(`/playlist/${playlistId}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-white">Loading your Spotify data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white/10 backdrop-blur-md rounded-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <img src={spotifyLogo} alt="Spotify Logo" className="h-8 mr-2" />
            <h1 className="text-2xl font-bold text-white">Spotify Organizer</h1>
          </div>
          
          <div className="flex items-center">
            {user && (
              <div className="flex items-center mr-6">
                {user.images && user.images[0] ? (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name} 
                    className="w-8 h-8 rounded-full mr-2" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-2">
                    <span className="text-white font-bold">{user.display_name?.substring(0, 1).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-white">{user.display_name}</span>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm"
            >
              Logout
            </button>
          </div>
        </header>
        
        {/* Main content */}
        <main>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-white mb-6">
            <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
            <p>Welcome to your Spotify Organizer! Here you can manage and organize your playlists.</p>
          </div>
          
          {/* Playlists */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Playlists ({playlists.length})</h2>
              <button 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Playlist
              </button>
            </div>
            
            {playlists.length === 0 ? (
              <div className="bg-white/5 p-6 rounded-lg text-center">
                <p className="text-gray-300 mb-4">You don't have any playlists yet.</p>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm">
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map(playlist => (
                  <PlaylistCard 
                    key={playlist.id} 
                    playlist={playlist} 
                    onClick={handlePlaylistClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;