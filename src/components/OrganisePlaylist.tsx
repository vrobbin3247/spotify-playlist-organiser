import { useParams } from 'react-router-dom';
import { getPlaylistDetails, getPlaylistTracks } from '../services/spotifyService';
import { createPlaylist, addTracksToPlaylist } from '../services/spotifyService';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

interface Track {
    track: {
      id: string;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        images: Array<{ url: string }>;
      };
    };
  }

export default function OrganisePlaylist() {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<any>(null);
    const [_tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [_direction, setDirection] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState(''); // Add this line
    const [isPublic, setIsPublic] = useState(false);
    const [createdPlaylists, setCreatedPlaylists] = useState<Record<number, {
        name: string,
        description: string,
        isPublic: boolean,
        gradient: string
    }>>({});
    const [playlistTracks, setPlaylistTracks] = useState<Record<number, Track[]>>({});
    const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const loadData = async () => {
            try {
                const playlistData = await getPlaylistDetails(id!);
                const tracksData = await getPlaylistTracks(id!);
                setPlaylist(playlistData);
                const validTracks = tracksData.items.filter((item: { track: any; }) => item.track) as Track[];
                setTracks(validTracks);
                setAvailableTracks(validTracks);
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
        setCurrentIndex((prev) => (prev + 1) % availableTracks.length);
    };

    const prevTrack = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev - 1 + availableTracks.length) % availableTracks.length);
    };

    const getVisibleCardIndexes = (trackList: Track[]) => {
        if (!trackList.length) return [];

        // Create an array of possible indices
        const indices = [];

        // Only add indices if we haven't exceeded the length of the track list
        for (let i = 0; i < 6; i++) {
            if (i < trackList.length) {
                indices.push((currentIndex + i) % trackList.length);
            }
        }

        // Return only unique indices
        return [...new Set(indices)];
    };

    const visibleIndexes = getVisibleCardIndexes(availableTracks);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, track: Track) => {
        e.dataTransfer.setData('track', JSON.stringify(track));
      };

      const handleDrop = (e: React.DragEvent<HTMLDivElement>, playlistNumber: number) => {
        e.preventDefault();
        if (!createdPlaylists[playlistNumber]) return;
      
        const trackData = e.dataTransfer.getData('track');
        const track: Track = JSON.parse(trackData);
      
        setPlaylistTracks(prev => ({
          ...prev,
          [playlistNumber]: [...(prev[playlistNumber] || []), track]
        }));
      
        setAvailableTracks(prev => prev.filter(t => t.track.id !== track.track.id));
      };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDestinationClick = (playlistNumber: number) => {
        if (createdPlaylists[playlistNumber]) return;
        setSelectedDestination(playlistNumber);
        setShowModal(true);
    };

    const getRandomGradient = () => {
        const gradients = [
            'from-green-500 to-blue-500',
            'from-purple-500 to-pink-500',
            'from-yellow-500 to-red-500',
            'from-indigo-500 to-purple-500',
            'from-blue-500 to-teal-500'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    };

    const savePlaylistsToSpotify = async () => {
        setIsSaving(true);
        try {
            const results = await Promise.all(
                Object.entries(createdPlaylists).map(async ([playlistNum, playlistData]) => {
                    const trackUris = playlistTracks[Number(playlistNum)]?.map((track: { track: { id: any; }; }) => `spotify:track:${track.track.id}`) || [];
                    if (trackUris.length === 0) return null;

                    const newPlaylist = await createPlaylist({
                        name: playlistData.name,
                        description: playlistData.description || `Organized from ${playlist?.name}`,
                        public: playlistData.isPublic || false
                    });

                    await addTracksToPlaylist(newPlaylist.id, trackUris);
                    return newPlaylist;
                })
            );

            if (results.some(Boolean)) {
                alert('Playlists successfully saved to Spotify!');
                navigate('/dashboard');
            } else {
                alert('No tracks to save');
            }
        } catch (error) {
            console.error('Error saving playlists:', error);
            alert(`Failed to save playlists: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">
                    {playlist?.name}
                </h1>

                {/* Destination cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((num) => {
                        const isCreated = createdPlaylists[num];
                        return (
                            <div
                                key={num}
                                onClick={() => handleDestinationClick(num)}
                                onDrop={(e) => handleDrop(e, num)}
                                onDragOver={handleDragOver}
                                className={`relative rounded-xl p-6 h-64 flex flex-col items-center justify-center 
                  transition-all duration-100 shadow-lg
                  ${isCreated ?
                                        `bg-gradient-to-br ${createdPlaylists[num].gradient} cursor-default` :
                                        `backdrop-blur-lg bg-white/10 border border-white/20 hover:text-spotify-green hover:border-green-400/50 cursor-pointer`
                                    }`}
                            >
                                {isCreated ? (
                                    <>
                                        <p className="text-white font-bold text-xl text-center">
                                            {createdPlaylists[num].name}
                                        </p>
                                        <p className="text-white/80 mt-2">
                                            {playlistTracks[num]?.length || 0} tracks
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-5xl mb-2 transition-colors">+</div>
                                        <p className="text-white/80">New Playlist {num}</p>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>


                {/* Track display - Spotify themed cards */}
                <div className="relative h-[400px] w-full max-w-4xl mx-auto mb-12">

                    <div className="relative flex items-center justify-center h-full">
                        <button onClick={prevTrack} className="absolute left-4 z-10 p-2 rounded-full bg-black/50 hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button onClick={nextTrack} className="absolute right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        {availableTracks.length > 0 ? (
                            <div className="relative flex items-center">
                                <AnimatePresence>
                                    {visibleIndexes.map((index, i) => {
                                        const track = availableTracks[index];
                                        if (!track) return null;

                                        return (
                                            <motion.div
                                                key={track.track.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, track)}
                                                layoutId={track.track.id} // 🔥 Prevents flickering on reorder
                                                className={`spotify-card absolute top-0 transition-transform duration-100 ease-in-out ${i !== 0 ? '-ml-16' : ''}`}
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8, x: -30 }}
                                                transition={{ duration: 0.1, ease: "easeInOut" }} // ⏳ Longer transition for smoothness
                                                whileHover={{ y: -10, scale: 1.05, boxShadow: "0 12px 20px rgba(0, 0, 0, 0.3)" }}
                                                style={{ zIndex: visibleIndexes.length - i }} // Maintain stacking
                                            >
                                                <div className="album-cover">
                                                    {track.track.album?.images?.[0]?.url ? (
                                                        <img
                                                            src={track.track.album.images[0].url}
                                                            alt={track.track.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="placeholder-cover flex items-center justify-center bg-gray-800">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M9 18V5l12-2v13"></path>
                                                                <circle cx="6" cy="18" r="3"></circle>
                                                                <circle cx="18" cy="16" r="3"></circle>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="track-info">
                                                    <h3 className="track-title">{track.track.name}</h3>
                                                    <p className="track-artist">
                                                        {track.track.artists.map(artist => artist.name).join(', ')}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                        ) : (
                            <div className="text-center text-gray-400">
                                All tracks have been organized!
                            </div>

                        )}

                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="bg-spotify-green px-4 py-2 rounded-full text-black text-m">
                            {availableTracks.length} track{availableTracks.length !== 1 ? 's' : ''} remaining
                        </div>
                    </div>
                </div>
                {/* Spotify-themed card styles */}
                <style>{`
                  .spotify-card {
                    display: flex;
                    flex-direction: column;
                    height: 280px;
                    width: 200px;
                    background-color: #121212;
                    border-radius: 8px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    z-index: ${visibleIndexes.length};
                  }

                  .spotify-card:hover {
                    background-color: #282828;
                  }

                  .spotify-card:hover ~ .spotify-card {
                    position: relative;
                    left: 50px;
                    transition: 0.3s ease-out;
                  }

                  .album-cover {
                    position: relative;
                    width: 100%;
                    height: 70%;
                    overflow: hidden;
                  }

                  .placeholder-cover {
                    width: 100%;
                    height: 100%;
                    color: #b3b3b3;
                  }

                  .play-icon {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    width: 40px;
                    height: 40px;
                    background-color: #1DB954;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    opacity: 0;
                    transform: translateY(8px);
                    transition: all 0.2s ease;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
                  }

                  .spotify-card:hover .play-icon {
                    opacity: 1;
                    transform: translateY(0);
                  }

                  .track-info {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                  }

                  .track-title {
                    color: white;
                    font-weight: 700;
                    font-size: 14px;
                    margin: 0 0 4px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }

                  .track-artist {
                    color: #b3b3b3;
                    font-size: 12px;
                    font-weight: 400;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                `}</style>

                {/* Create Playlist Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
                        <div className="bg-gray-900/90 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-xl transition-all transform scale-105">
                            <h2 className="text-2xl font-semibold text-white mb-4">
                                Create Playlist #{selectedDestination}
                            </h2>

                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Playlist Name*</label>
                                <input
                                    type="text"
                                    value={playlistName}
                                    onChange={(e) => {
                                        setPlaylistName(e.target.value);
                                        setError(''); // Remove error when user types
                                    }}
                                    className={`w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none border transition-all ${error ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-700 focus:ring-2 focus:ring-green-500'
                                        }`}
                                    placeholder="My Awesome Playlist"
                                    required
                                />
                                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm mb-2">Description</label>
                                <textarea
                                    value={playlistDescription}
                                    onChange={(e) => setPlaylistDescription(e.target.value)}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700 transition"
                                    placeholder="What's this playlist about?"
                                    rows={3}
                                />
                            </div>

                            <div className="mb-6 flex items-center justify-between">
                                <label className="block text-gray-400 text-sm">Visibility</label>
                                <div className="flex items-center">
                                    <span className="mr-2 text-gray-400">Private</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isPublic}
                                            onChange={() => setIsPublic(!isPublic)}
                                        />
                                        <div className="w-12 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                    <span className="ml-2 text-gray-400">Public</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setPlaylistName('');
                                        setPlaylistDescription('');
                                        setIsPublic(false);
                                        setError('');
                                    }}
                                    className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!playlistName.trim()) {
                                            setError('Playlist name is required');
                                            return;
                                        }
                                        const gradient = getRandomGradient();
                                        setCreatedPlaylists(prev => ({
                                            ...prev,
                                            [selectedDestination!]: {
                                                name: playlistName,
                                                description: playlistDescription,
                                                isPublic,
                                                gradient: gradient
                                            }
                                        }));
                                        setShowModal(false);
                                        setPlaylistName('');
                                        setPlaylistDescription('');
                                        setIsPublic(false);
                                        setError('');
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-medium rounded-full shadow-md transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {availableTracks.length === 0 && Object.keys(createdPlaylists).length > 0 && (
                    <div className="fixed bottom-6 right-6">
                        <button
                            onClick={savePlaylistsToSpotify}
                            disabled={isSaving}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                                    </svg>
                                    Save Playlists to Spotify
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}