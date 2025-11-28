import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { playlistAPI } from '../services/api';
import { Play, Music } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export default function Playlist() {
  const { id } = useParams();
  const { setQueue } = usePlayerStore();

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistAPI.get(id).then(res => res.data)
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!playlist) {
    return <div className="p-8">Playlist not found</div>;
  }

  const songs = playlist.songs?.map(ps => ps.song) || [];

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-end gap-6 mb-8">
        <div className="w-48 h-48 bg-dark-800 rounded flex items-center justify-center">
          {playlist.cover ? (
            <img
              src={playlist.cover}
              alt={playlist.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <Music size={80} className="text-dark-600" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase mb-2">Playlist</p>
          <h1 className="text-6xl font-bold mb-4">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-dark-400 mb-2">{playlist.description}</p>
          )}
          <p className="text-dark-400">
            {playlist.user?.displayName} • {songs.length} songs
          </p>
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

      {songs.length === 0 ? (
        <div className="text-center py-20">
          <Music size={64} className="mx-auto mb-4 text-dark-700" />
          <h2 className="text-2xl font-semibold mb-2">This playlist is empty</h2>
          <p className="text-dark-400">Add some songs to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 rounded hover:bg-dark-800 transition-colors group cursor-pointer"
              onClick={() => setQueue(songs, index)}
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
