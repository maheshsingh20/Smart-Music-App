import { Play, Heart, MoreVertical } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';
import { useState, useEffect } from 'react';

export default function SongCard({ song, showArtist = true }) {
  const { setCurrentSong, setQueue } = usePlayerStore();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  // Check if song is liked
  const { data: likedSongs } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: () => userAPI.getLikedSongs().then(res => res.data)
  });

  useEffect(() => {
    if (likedSongs && song) {
      setIsLiked(likedSongs.some(ls => ls.id === song.id));
    }
  }, [likedSongs, song]);

  const likeMutation = useMutation({
    mutationFn: () => userAPI.likeSong(song.id),
    onSuccess: () => {
      setIsLiked(true);
      queryClient.invalidateQueries(['likedSongs']);
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: () => userAPI.unlikeSong(song.id),
    onSuccess: () => {
      setIsLiked(false);
      queryClient.invalidateQueries(['likedSongs']);
    }
  });

  const handlePlay = () => {
    setCurrentSong(song);
    setQueue([song], 0);
  };

  return (
    <div className="card group cursor-pointer" onClick={handlePlay}>
      <div className="relative mb-3">
        <img
          src={song.cover}
          alt={song.title}
          className="w-full aspect-square object-cover rounded"
        />
        <button
          className="absolute bottom-2 right-2 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          aria-label="Play"
        >
          <Play size={20} fill="white" />
        </button>
      </div>

      <h3 className="font-semibold truncate mb-1">{song.title}</h3>
      {showArtist && (
        <p className="text-sm text-dark-400 truncate">Artist Name</p>
      )}

      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isLiked) {
              unlikeMutation.mutate();
            } else {
              likeMutation.mutate();
            }
          }}
          className={`transition-colors ${isLiked ? 'text-primary-500' : 'text-dark-400 hover:text-primary-500'}`}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-dark-400 hover:text-dark-50 transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
