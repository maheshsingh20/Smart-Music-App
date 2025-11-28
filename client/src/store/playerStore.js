import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      originalQueue: [], // Store original order for shuffle
      queueIndex: 0,
      isPlaying: false,
      volume: 0.7,
      repeat: 'off', // 'off', 'all', 'one'
      shuffle: false,
      crossfade: 0,
      progress: 0,

      setCurrentSong: (song) => {
        const state = get();
        // If clicking a new song, add it to queue if not already there
        if (!state.queue.find(s => s.id === song.id)) {
          set({
            currentSong: song,
            isPlaying: true,
            queue: [song],
            originalQueue: [song],
            queueIndex: 0,
            progress: 0
          });
        } else {
          // Find the song in queue and play it
          const index = state.queue.findIndex(s => s.id === song.id);
          set({
            currentSong: song,
            isPlaying: true,
            queueIndex: index,
            progress: 0
          });
        }
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (volume) => set({ volume }),

      setProgress: (progress) => set({ progress }),

      setRepeat: (repeat) => set({ repeat }),

      toggleShuffle: () => {
        const state = get();
        const newShuffle = !state.shuffle;

        if (newShuffle) {
          // Enable shuffle: randomize queue but keep current song
          const currentSong = state.queue[state.queueIndex];
          const otherSongs = state.queue.filter((_, i) => i !== state.queueIndex);
          const shuffled = otherSongs.sort(() => Math.random() - 0.5);
          const newQueue = [currentSong, ...shuffled];

          set({
            shuffle: true,
            queue: newQueue,
            queueIndex: 0,
            originalQueue: state.queue // Save original order
          });
        } else {
          // Disable shuffle: restore original order
          const currentSong = state.currentSong;
          const originalIndex = state.originalQueue.findIndex(s => s.id === currentSong.id);

          set({
            shuffle: false,
            queue: state.originalQueue,
            queueIndex: originalIndex >= 0 ? originalIndex : 0
          });
        }
      },

      setCrossfade: (crossfade) => set({ crossfade }),

      setQueue: (queue, startIndex = 0) => {
        const song = queue[startIndex];
        set({
          queue,
          originalQueue: queue,
          queueIndex: startIndex,
          currentSong: song,
          isPlaying: true,
          progress: 0
        });
      },

      playNext: () => {
        const { queue, queueIndex, repeat, currentSong } = get();

        if (repeat === 'one') {
          // Replay current song
          set({ progress: 0 });
          return;
        }

        let nextIndex = queueIndex + 1;

        if (nextIndex >= queue.length) {
          if (repeat === 'all') {
            nextIndex = 0;
          } else {
            // End of queue, stop playing
            set({ isPlaying: false });
            return;
          }
        }

        set({
          queueIndex: nextIndex,
          currentSong: queue[nextIndex],
          isPlaying: true,
          progress: 0
        });
      },

      playPrevious: () => {
        const { queue, queueIndex } = get();

        // If more than 3 seconds into song, restart it
        const audio = document.querySelector('audio');
        if (audio && audio.currentTime > 3) {
          audio.currentTime = 0;
          set({ progress: 0 });
          return;
        }

        const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
        set({
          queueIndex: prevIndex,
          currentSong: queue[prevIndex],
          isPlaying: true,
          progress: 0
        });
      },

      addToQueue: (song) => {
        const state = get();
        const newQueue = [...state.queue, song];
        set({
          queue: newQueue,
          originalQueue: state.shuffle ? state.originalQueue : newQueue
        });
      },

      removeFromQueue: (index) => {
        const state = get();
        const newQueue = state.queue.filter((_, i) => i !== index);
        const newOriginalQueue = state.originalQueue.filter((_, i) => i !== index);

        // Adjust current index if needed
        let newIndex = state.queueIndex;
        if (index < state.queueIndex) {
          newIndex--;
        } else if (index === state.queueIndex) {
          newIndex = Math.min(newIndex, newQueue.length - 1);
        }

        set({
          queue: newQueue,
          originalQueue: newOriginalQueue,
          queueIndex: newIndex,
          currentSong: newQueue[newIndex] || null
        });
      }
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
        crossfade: state.crossfade,
        queue: state.queue,
        originalQueue: state.originalQueue,
        queueIndex: state.queueIndex,
        currentSong: state.currentSong
      })
    }
  )
);
