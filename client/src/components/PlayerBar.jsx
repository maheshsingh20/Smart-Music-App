import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Heart, SkipForward as Forward10 } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { usePlayerStore } from '../store/playerStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../services/api';

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    volume,
    repeat,
    shuffle,
    progress,
    togglePlay,
    setVolume,
    setProgress,
    setRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    setCurrentSong
  } = usePlayerStore();

  const audioRef = useRef(null);
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previousSongId = useRef(null);

  // Use audioUrl directly from the song object
  const streamData = currentSong ? { url: currentSong.audioUrl } : null;

  // Check if song is liked
  const { data: likedSongs } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: () => userAPI.getLikedSongs().then(res => res.data),
    enabled: !!currentSong
  });

  useEffect(() => {
    if (likedSongs && currentSong) {
      setIsLiked(likedSongs.some(ls => ls.songId === currentSong.id));
    }
  }, [likedSongs, currentSong]);

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: (songId) => userAPI.likeSong(songId),
    onSuccess: () => {
      setIsLiked(true);
      queryClient.invalidateQueries(['likedSongs']);
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: (songId) => userAPI.unlikeSong(songId),
    onSuccess: () => {
      setIsLiked(false);
      queryClient.invalidateQueries(['likedSongs']);
    }
  });

  const handleLikeToggle = () => {
    if (!currentSong) return;
    if (isLiked) {
      unlikeMutation.mutate(currentSong.id);
    } else {
      likeMutation.mutate(currentSong.id);
    }
  };

  // Play/Pause control
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Play failed:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Auto-play when song changes
  useEffect(() => {
    const audio = audioRef.current;

    // Only trigger if song actually changed
    if (!audio || !currentSong || previousSongId.current === currentSong.id) {
      return;
    }

    previousSongId.current = currentSong.id;

    if (streamData?.url) {
      setIsLoading(true);
      setProgress(0);

      // Pause current playback
      audio.pause();
      audio.currentTime = 0;

      // Set new source and load
      audio.src = streamData.url;
      audio.load();

      // Play when ready
      if (isPlaying) {
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
              console.log('Playing:', currentSong.title);
            })
            .catch(err => {
              setIsLoading(false);
              console.error('Auto-play failed:', err);
            });
        }
      } else {
        setIsLoading(false);
      }
    }
  }, [currentSong?.id]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration;
      setProgress(value[0]);
    }
  };

  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        audioRef.current.duration
      );
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-800 px-4 py-3 z-50">
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Audio playback error:', e);
          setIsLoading(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
      />

      <div className="flex items-center justify-between gap-4">
        {/* Current Song Info */}
        <div className="flex items-center gap-3 w-64">
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-14 h-14 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{currentSong.title}</p>
            <p className="text-sm text-dark-400 truncate">{currentSong.artistName || 'Unknown Artist'}</p>
          </div>
          <button
            onClick={handleLikeToggle}
            className={`transition-colors ${isLiked ? 'text-primary-500' : 'text-dark-400 hover:text-primary-500'}`}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
            title={isLiked ? 'Remove from liked songs' : 'Add to liked songs'}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Player Controls */}
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${shuffle ? 'text-primary-500' : 'text-dark-400 hover:text-dark-50'}`}
              aria-label="Toggle shuffle"
              title={shuffle ? 'Shuffle on' : 'Shuffle off'}
            >
              <Shuffle size={20} />
            </button>
            <button
              onClick={playPrevious}
              className="text-dark-400 hover:text-dark-50 transition-colors"
              aria-label="Previous track"
              title="Previous"
            >
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 rounded-full transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-dark-400 hover:text-dark-50 transition-colors"
              aria-label="Next track"
              title="Next"
            >
              <SkipForward size={24} />
            </button>
            <button
              onClick={handleForward}
              className="text-dark-400 hover:text-dark-50 transition-colors"
              aria-label="Forward 10 seconds"
              title="Forward 10s"
            >
              <Forward10 size={20} />
            </button>
            <button
              onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
              className={`transition-colors ${repeat !== 'off' ? 'text-primary-500' : 'text-dark-400 hover:text-dark-50'}`}
              aria-label="Toggle repeat"
              title={repeat === 'off' ? 'Repeat off' : repeat === 'all' ? 'Repeat all' : 'Repeat one'}
            >
              <Repeat size={20} />
              {repeat === 'one' && <span className="text-xs absolute">1</span>}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-400 w-10 text-right">
              {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
            </span>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[progress || 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              aria-label="Seek"
            >
              <Slider.Track className="bg-dark-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-3 h-3 bg-white rounded-full hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </Slider.Root>
            <span className="text-xs text-dark-400 w-10">
              {audioRef.current ? formatTime(audioRef.current.duration || 0) : '0:00'}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 w-32">
          <Volume2 size={20} className="text-dark-400" />
          <Slider.Root
            className="relative flex items-center select-none touch-none flex-1 h-5"
            value={[volume * 100]}
            onValueChange={(value) => setVolume(value[0] / 100)}
            max={100}
            step={1}
            aria-label="Volume"
          >
            <Slider.Track className="bg-dark-700 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-3 h-3 bg-white rounded-full hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </Slider.Root>
        </div>
      </div>
    </div>
  );
}
