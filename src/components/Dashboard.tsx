// src/components/Dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { getUserProfile, getUserPlaylists, refreshAccessToken } from '../services/spotifyService';
import spotifyLogo from "../assets/Spotify_Primary_Logo_RGB_Green.png";
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
        const accessToken = localStorage.getItem('spotify_access_token');
        if (!accessToken) {
          navigate('/auth');
          return;
        }
  
        try {
          const userProfile = await getUserProfile();
          setUser(userProfile);
          
          const playlistsData = await getUserPlaylists();
          setPlaylists(playlistsData.items || []);
        } catch (error) {
          // Try to refresh token if the error is 401
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            await refreshAccessToken();
            // Retry with new token
            const userProfile = await getUserProfile();
            setUser(userProfile);
            
            const playlistsData = await getUserPlaylists();
            setPlaylists(playlistsData.items || []);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        if (error instanceof Error) {
          setError(error.message.includes('401') ? 'Session expired. Please login again.' : error.message);
        } else {
          setError('Failed to load dashboard data');
        }
        // Clear tokens on error
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
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
            {/* <h1 className="text-2xl mr-1.5 font-bold text-white">Spotify</h1> */}
            <h1 className="text-2xl font-bold text-spotify-green">Playlist Organizer</h1>
          </div>
          
          {user && (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none">
                  <div className="flex items-center">
                    {user.images?.[0]?.url ? (
                      <img 
                        src={user.images[0].url} 
                        alt={user.display_name} 
                        className="w-8 h-8 rounded-full mr-2" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-2">
                        <span className="text-white font-bold">
                          {user.display_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-white">{user.display_name}</span>
                    <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-300" />
                  </div>
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-1 py-1">
                    {/* <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-700 text-white' : 'text-gray-200'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={() => navigate('/profile')}
                        >
                          <UserIcon className="w-4 h-4 mr-2" />
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-700 text-white' : 'text-gray-200'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={() => navigate('/settings')}
                        >
                          <CogIcon className="w-4 h-4 mr-2" />
                          Settings
                        </button>
                      )}
                    </Menu.Item> */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-red-500 text-white' : 'text-red-400'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={handleLogout}
                        >
                          <LogoutIcon className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </header>

        {/* Main content */}
        <main>
          {/* <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-white mb-6">
            <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
            <p>Welcome to your Spotify Organizer! Here you can manage and organize your playlists.</p>
          </div> */}
          
          {/* Playlists */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Playlists ({playlists.length})</h2>
              {/* <button 
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Playlist
              </button> */}
            </div>
            
            {playlists.length === 0 ? (
  <div className="bg-white/5 p-6 rounded-lg text-center">
    <p className="text-gray-300 mb-4">You don't have any playlists yet.</p>
    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm">
      Create Your First Playlist
    </button>
  </div>
) : (
  <div className="relative">
    {/* Single scroll container for both rows */}
    <div className="overflow-x-auto pb-4">
      {/* Container that holds both rows */}
      <div className="w-max space-y-4"> {/* w-max makes container only as wide as content */}
        {/* First row - even indexes */}
        <div className="flex space-x-4">
          {playlists.map((playlist, index) => {
            if (index % 2 !== 0) return null;
            return (
              <div key={playlist.id} className="flex-none w-64">
                <PlaylistCard 
                  playlist={playlist} 
                  onClick={handlePlaylistClick}
                />
              </div>
            );
          })}
        </div>
        
        {/* Second row - odd indexes */}
        <div className="flex space-x-4">
          {playlists.map((playlist, index) => {
            if (index % 2 === 0) return null;
            return (
              <div key={playlist.id} className="flex-none w-64">
                <PlaylistCard 
                  playlist={playlist} 
                  onClick={handlePlaylistClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}
          </div>
        </main>
      </div>
    </div>
  );
}
  
        
        
function ChevronDownIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CogIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LogoutIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export default Dashboard;