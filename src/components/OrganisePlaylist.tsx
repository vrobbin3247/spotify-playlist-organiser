import { useParams } from 'react-router-dom';
import { getPlaylistDetails, getPlaylistTracks } from '../services/spotifyService';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

export default function OrganisePlaylist() {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 0 = forward, 1 = backward

  useEffect(() => {
    const loadData = async () => {
      try {
        const playlistData = await getPlaylistDetails(id!);
        const tracksData = await getPlaylistTracks(id!);
        setPlaylist(playlistData);
        setTracks(tracksData.items || []);
      } catch (error) {
        console.error('Error loading playlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const nextTrack = () => {
    setDirection(0);
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  // Calculate indexes for stacked cards
  const getVisibleCardIndexes = () => {
    const visibleIndexes = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % tracks.length;
      visibleIndexes.push(index);
    }
    return visibleIndexes;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const visibleIndexes = getVisibleCardIndexes();

  return (
    <div className="min-h-screen p-6">
      <div className="w-lvh">
        <h1 className="text-3xl font-bold text-white mb-6">
          Organising: {playlist?.name}
        </h1>
        
        {/* Glass effect destination cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num}
              className="relative rounded-xl p-6 h-64 flex flex-col items-center justify-center 
                         backdrop-blur-lg bg-white/10 border border-white/20 
                         hover:border-green-400/50 transition-all duration-300 
                         shadow-lg hover:shadow-green-500/20 cursor-pointer
                         before:absolute before:inset-0 before:bg-gradient-to-br 
                         before:from-white/10 before:to-transparent before:rounded-xl 
                         before:z-[-1] overflow-hidden"
            >
              <div className="text-5xl text-white/80 hover:text-green-400 mb-2 transition-colors">+</div>
              <p className="text-white/80">New Playlist {num}</p>
            </div>
          ))}
        </div>

        {/* Stacked track display */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Current Track ({currentIndex + 1}/{tracks.length})
          </h2>
          
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Navigation arrows */}
            <button 
              onClick={prevTrack}
              className="absolute left-4 z-10 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={nextTrack}
              className="absolute right-4 z-10 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Stacked cards display */}
            <div className="relative w-64 h-96">
              {visibleIndexes.map((index, i) => (
                <motion.div
                  key={tracks[index]?.track?.id || index}
                  initial={{ 
                    opacity: i === 0 ? 0 : 0.5,
                    y: i * 20,
                    scale: 1 - (i * 0.05),
                    zIndex: 3 - i
                  }}
                  animate={{ 
                    opacity: i === 0 ? 1 : 0.5 - (i * 0.1),
                    y: i * 20,
                    scale: 1 - (i * 0.05),
                    zIndex: 3 - i
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30
                  }}
                  className="absolute top-0 left-0 w-full rounded-lg overflow-hidden shadow-xl 
                            bg-white/10 backdrop-blur-lg border border-white/20"
                  style={{ 
                    transformOrigin: "top center",
                  }}
                >
                  {/* Square image container with play button */}
              <div className="w-full aspect-square relative group">
                {tracks[index]?.track?.album?.images?.[0]?.url ? (
                  <>
                    <img 
                      src={tracks[index].track.album.images[0].url} 
                      alt={tracks[index].track.name}
                      className="w-full h-full object-contain p-2"
                    />
                    {/* Green play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-8 w-8 text-white" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                    🎵
                  </div>
                )}
              </div>
                  
                  {/* Track details */}
                  <div className="p-4">
                    <p className="text-white font-medium text-center truncate">
                      {tracks[index]?.track?.name || 'Unknown Track'}
                    </p>
                    <p className="text-gray-400 text-sm text-center truncate mt-1">
                      {tracks[index]?.track?.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}