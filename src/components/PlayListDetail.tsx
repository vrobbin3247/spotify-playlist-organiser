// src/components/PlaylistDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// This would be in your spotifyService.ts
const getPlaylistDetails = async (playlistId: string) => {
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

// This would be in your spotifyService.ts
const getPlaylistTracks = async (playlistId: string) => {
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

function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPlaylistData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const playlistData = await getPlaylistDetails(id);
        setPlaylist(playlistData);
        
        const tracksData = await getPlaylistTracks(id);
        setTracks(tracksData.items || []);
      } catch (error) {
        console.error('Error loading playlist:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load playlist');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlaylistData();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-white">Loading playlist...</p>
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
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white/10 backdrop-blur-md rounded-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Playlist Not Found</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-white hover:text-green-400"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Playlist header */}
          <div className="md:w-1/3">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              {playlist.images && playlist.images[0] ? (
                <img 
                  src={playlist.images[0].url} 
                  alt={playlist.name} 
                  className="w-full aspect-square object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                </div>
              )}
              
              <h1 className="text-2xl font-bold text-white mb-2">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-gray-300 mb-4">{playlist.description}</p>
              )}
              
              <div className="flex items-center text-sm text-gray-300 mb-1">
                <span>Created by: {playlist.owner.display_name}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-300 mb-4">
                <span>{tracks.length} tracks</span>
                <span className="mx-2">•</span>
                <span>{playlist.public ? 'Public' : 'Private'}</span>
              </div>
              
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm">
                  Play
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm">
                  Edit
                </button>
              </div>
            </div>
          </div>
          
          {/* Tracks list */}
          <div className="md:w-2/3">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <h2 className="text-xl font-bold text-white mb-4">Tracks</h2>
              
              {tracks.length === 0 ? (
                <p className="text-gray-300">This playlist has no tracks.</p>
              ) : (
                <div className="space-y-2">
                  {tracks.map((item, index) => (
                    <div key={item.track.id || index} className="flex items-center p-2 hover:bg-white/5 rounded-lg">
                      <div className="w-8 text-right text-gray-400 mr-4">
                        {index + 1}
                      </div>
                      
                      {item.track.album.images && item.track.album.images[2] ? (
                        <img 
                          src={item.track.album.images[2].url} 
                          alt={item.track.album.name} 
                          className="w-10 h-10 rounded mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded mr-3" />
                      )}
                      
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-white truncate">{item.track.name}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {item.track.artists.map((artist: any) => artist.name).join(', ')}
                        </div>
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        {Math.floor(item.track.duration_ms / 60000)}:
                        {Math.floor((item.track.duration_ms % 60000) / 1000)
                          .toString()
                          .padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistDetail;