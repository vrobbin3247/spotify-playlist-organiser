import { useParams } from 'react-router-dom';
import { getPlaylistDetails, getPlaylistTracks } from '../services/spotifyService';
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
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
    const [playlistName, setPlaylistName] = useState('');
    const [createdPlaylists, setCreatedPlaylists] = useState<Record<number, { name: string, gradient: string }>>({});
    const [playlistTracks, setPlaylistTracks] = useState<Record<number, Track[]>>({});
    const [availableTracks, setAvailableTracks] = useState<Track[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const playlistData = await getPlaylistDetails(id!);
                const tracksData = await getPlaylistTracks(id!);
                setPlaylist(playlistData);
                const validTracks = tracksData.items.filter(item => item.track) as Track[];
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
        return [
            currentIndex % trackList.length,
            (currentIndex + 1) % trackList.length,
            (currentIndex + 2) % trackList.length
        ];
    };

    const visibleIndexes = getVisibleCardIndexes(availableTracks);

    const handleDragStart = (e: React.DragEvent, track: Track) => {
        e.dataTransfer.setData('track', JSON.stringify(track));
    };

    const handleDrop = (e: React.DragEvent, playlistNumber: number) => {
        e.preventDefault();
        if (!createdPlaylists[playlistNumber]) return;

        const trackData = e.dataTransfer.getData('track');
        const track = JSON.parse(trackData) as Track;

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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">
                    Organising: {playlist?.name}
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
                  transition-all duration-300 shadow-lg
                  ${isCreated ?
                                        `bg-gradient-to-br ${createdPlaylists[num].gradient} cursor-default` :
                                        `backdrop-blur-lg bg-white/10 border border-white/20 hover:border-green-400/50 cursor-pointer`
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

                {/* Track display - Original carousel UI */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white mb-4">
                        {availableTracks.length > 0 ?
                            `Tracks (${currentIndex + 1}/${availableTracks.length})` :
                            'All tracks organized!'}
                    </h2>

                    {availableTracks.length > 0 ? (
                        <div className="relative h-96 flex items-center justify-center">
                            <button
                                onClick={prevTrack}
                                className="absolute left-4 z-10 p-2 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={nextTrack}
                                className="absolute right-4 z-10 p-2 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <div className="relative w-full h-full flex items-center justify-center">
    <AnimatePresence mode="wait">
        {visibleIndexes.length > 0 && (
            (() => {
                const track = availableTracks[visibleIndexes[0]];
                if (!track) return null;

                return (
                    <motion.div
                        key={track.track.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, track)}
                        initial={{ opacity: 0, x: 100, rotateY: 90 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -100, rotateY: -90 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute rounded-xl overflow-hidden shadow-lg backdrop-blur-md bg-white/10 border border-white/20  w-64"
                        style={{
                            transformOrigin: "center",
                            perspective: "1000px",
                        }}
                    >
                        {/* Album Image (Fixed Aspect Ratio, No Cropping) */}
                        <div className="h-full w-full flex items-center justify-center bg-black/20">
                            {track.track.album?.images?.[0]?.url ? (
                                <img
                                    src={track.track.album.images[0].url}
                                    alt={track.track.name}
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                                    🎵
                                </div>
                            )}
                        </div>

                        {/* Track Details */}
                        <div className="px-4 py-2 h-16 flex flex-col justify-center text-center">
                            <p className="text-white font-semibold text-lg truncate">
                                {track.track.name}
                            </p>
                            <p className="text-gray-300 text-sm truncate">
                                {track.track.artists.map(artist => artist.name).join(", ")}
                            </p>
                        </div>
                    </motion.div>
                );
            })()
        )}
    </AnimatePresence>
</div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            All tracks have been organized!
                        </div>
                    )}
                </div>

                {/* Create Playlist Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-600">
                            <h2 className="text-xl font-bold text-white mb-4">
                                Name Your Playlist #{selectedDestination}
                            </h2>

                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm mb-2">Playlist Name</label>
                                <input
                                    type="text"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="My Awesome Playlist"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setPlaylistName('');
                                    }}
                                    className="px-4 py-2 text-white hover:bg-gray-700 rounded-full"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const gradient = getRandomGradient();
                                        setCreatedPlaylists(prev => ({
                                            ...prev,
                                            [selectedDestination!]: {
                                                name: playlistName,
                                                gradient: gradient
                                            }
                                        }));
                                        setShowModal(false);
                                        setPlaylistName('');
                                    }}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                                    disabled={!playlistName.trim()}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}