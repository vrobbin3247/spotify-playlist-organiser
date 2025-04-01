// src/components/PlaylistDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistDetails, getPlaylistTracks } from '../services/spotifyService';
import {OrganisePlaylist} from './OrganisePlaylist'

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
  
        // Add this logging code
        console.log('Tracks with preview URLs:', 
          tracksData.items.filter(item => item.track?.preview_url).map(item => ({
            name: item.track.name,
            preview_url: item.track.preview_url
          }))
        );
  
        // Also log the total count
        const totalTracks = tracksData.items.length;
        const tracksWithPreview = tracksData.items.filter(item => item.track?.preview_url).length;
        console.log(`Preview availability: ${tracksWithPreview}/${totalTracks} tracks have preview URLs`);
  
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

  // Rest of the component remains the same
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-white hover:text-green-400"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Dashboard
        </button>

        {/* Playlist header - now at the top */}
        <div className="flex items-start gap-6 mb-8">
          {playlist.images && playlist.images[0] ? (
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
              className="w-48 h-48 object-cover rounded-lg shadow-xl"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-700 rounded-lg shadow-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
          )}

          <div className="flex flex-col justify-end">
            <p className="text-white uppercase text-xs font-bold mb-2">Playlist</p>
            <h1 className="text-5xl font-bold text-white mb-4">{playlist.name}</h1>

            {playlist.description && (
              <p className="text-gray-300 text-sm mb-4">{playlist.description}</p>
            )}

            <div className="flex items-center text-sm text-gray-300">
              <span className="font-bold text-white">{playlist.owner.display_name}</span>
              <span className="mx-1">•</span>
              <span>{tracks.length} songs</span>
            </div>

            {/* Enhanced Organise button */}
            <div className="mt-6 flex items-center gap-4">

              {/* Organize button - more prominent but integrated */}
              <button
                className="px-6 py-3 bg-white text-black rounded-full 
    text-base font-bold flex items-center gap-2 shadow-md 
    hover:scale-105 hover:bg-green-500 transition-all duration-200"
    onClick={() => navigate(`/organise/${id}`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Organise Playlist
              </button>

              {/* Other standard controls like heart/like button can go here */}
            </div>
          </div>
        </div>

        {/* Tracks container - now with fixed width */}
        <div className="rounded-lg overflow-hidden w-full">
          {/* Tracks header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-gray-700 text-gray-400 text-sm font-medium">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Title</div>
            <div className="col-span-4">Artist</div>
            <div className="col-span-2 text-right">Duration</div>
          </div>

          {/* Scrollable tracks container with fixed width */}
          <div className="max-h-[calc(8*4.5rem)] overflow-y-auto scrollbar w-full">
            {tracks.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                This playlist has no tracks.
              </div>
            ) : (
              tracks.map((item, index) => (
                <div
                  key={item.track.id || index}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-700/50 group w-full"
                >
                  <div className="col-span-1 flex items-center justify-center text-gray-400 group-hover:text-white">
                    {index + 1}
                  </div>

                  <div className="col-span-5 flex items-center min-w-0">
                    {item.track.album.images && item.track.album.images[2] ? (
                      <img
                        src={item.track.album.images[2].url}
                        alt={item.track.album.name}
                        className="w-10 h-10 rounded mr-3 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-700 rounded mr-3 flex-shrink-0" />
                    )}
                    <div className="truncate w-full">
                      <div className="font-medium text-white truncate">{item.track.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {item.track.album.name}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 flex items-center text-gray-400 group-hover:text-white truncate min-w-0">
                    {item.track.artists.map((artist: any) => artist.name).join(', ')}
                  </div>

                  <div className="col-span-2 flex items-center justify-end text-gray-400 group-hover:text-white whitespace-nowrap">
                    {Math.floor(item.track.duration_ms / 60000)}:
                    {Math.floor((item.track.duration_ms % 60000) / 1000)
                      .toString()
                      .padStart(2, '0')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistDetail;