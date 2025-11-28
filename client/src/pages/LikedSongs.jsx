import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';
import { Heart, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export default function LikedSongs() {
  const { setQueue } = usePlayerStore();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: () => userAPI.getLikedSongs().then(res => res.data)
  });

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-gradient-to-br from-primary-600 to-primary-800 rounded flex items-center justify-center">
          <Heart size={80} fill="white" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase mb-2">Playlist</p>
          <h1 className="text-6xl font-bold mb-4">Liked Songs</h1>
          <p className="text-dark-400">{songs.length} songs</p>
        </div>
      </div>

      {songs.length > 0 && (
        <button
          onClick={handlePlayAll}
          className="btn-primary flex items-center gap-2 mb-6"
        >
          <Play size={20} fill="white" />
          Play All
        </button>
      )}

      {isLoading ? (
        <p className="text-dark-400">Loading...</p>
      ) : songs.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto mb-4 text-dark-700" />
          <h2 className="text-2xl font-semibold mb-2">No liked songs yet</h2>
          <p className="text-dark-400">Songs you like will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 rounded hover:bg-dark-800 transition-colors group"
            >
              <span className="text-dark-400 w-8 text-center">{index + 1}</span>
              <img
                src={song.cover}
                alt={song.title}
                className="w-12 h-12 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-dark-400 truncate">Artist Name</p>
              </div>
              <span className="text-sm text-dark-400">
                {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
