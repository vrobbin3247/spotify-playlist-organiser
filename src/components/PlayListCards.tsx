// src/components/PlaylistCard.tsx
import React from 'react';

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description: string;
    images: Array<{ url: string }>;
    tracks: { total: number };
    owner: { display_name: string };
    public: boolean;
  };
  onClick?: (playlistId: string) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(playlist.id);
    }
  };

  return (
    <div 
      className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105 h-full"
      onClick={handleClick}
    >
      <div className="flex flex-col">
        {/* Playlist Image */}
        <div className="mb-3 aspect-square w-full overflow-hidden rounded bg-black/20">
          {playlist.images && playlist.images[0] ? (
            <img 
              src={playlist.images[0].url} 
              alt={playlist.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
          )}
        </div>

        {/* Playlist Info */}
        <div>
          <h3 className="font-bold text-white text-base truncate">{playlist.name}</h3>
          {playlist.description && (
            <p className="text-gray-300 text-xs mt-1 line-clamp-2 h-8 overflow-hidden">
              {playlist.description}
            </p>
          )}
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-300">{playlist.tracks.total} tracks</p>
            <div className="flex items-center">
              {playlist.public ? (
                <span className="text-xs bg-green-900/60 text-green-300 px-2 py-0.5 rounded-full">Public</span>
              ) : (
                <span className="text-xs bg-gray-700/60 text-gray-300 px-2 py-0.5 rounded-full">Private</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;