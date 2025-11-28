import { useQuery } from '@tanstack/react-query';
import { songAPI, aiAPI } from '../services/api';
import SongCard from '../components/SongCard';
import { useState } from 'react';
import { Sparkles, TrendingUp, Radio, Heart } from 'lucide-react';

const moods = [
  { id: 'happy', name: 'Happy', emoji: '😊', color: 'bg-yellow-500' },
  { id: 'sad', name: 'Sad', emoji: '😢', color: 'bg-blue-500' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', color: 'bg-red-500' },
  { id: 'chill', name: 'Chill', emoji: '😌', color: 'bg-green-500' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', color: 'bg-pink-500' },
  { id: 'focus', name: 'Focus', emoji: '🎯', color: 'bg-purple-500' },
  { id: 'workout', name: 'Workout', emoji: '💪', color: 'bg-orange-500' },
  { id: 'party', name: 'Party', emoji: '🎉', color: 'bg-indigo-500' }
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState(null);

  // AI-powered recommendations
  const { data: aiRecommendations } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => aiAPI.getRecommendations().then(res => res.data)
  });

  // Trending songs
  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => aiAPI.getTrending(12).then(res => res.data)
  });

  // Mood-based songs
  const { data: moodSongs } = useQuery({
    queryKey: ['mood-songs', selectedMood],
    queryFn: () => aiAPI.getMoodSongs(selectedMood).then(res => res.data),
    enabled: !!selectedMood
  });

  // Recent songs fallback
  const { data: recentSongs } = useQuery({
    queryKey: ['songs', 'recent'],
    queryFn: () => songAPI.getSongs({ limit: 12 }).then(res => res.data)
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back</h1>
        <p className="text-dark-400">Discover music powered by AI</p>
      </div>

      {/* Mood Selection */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-primary-500" size={24} />
          <h2 className="text-2xl font-bold">How are you feeling?</h2>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-lg text-center transition-all hover:scale-105 ${selectedMood === mood.id
                ? `${mood.color} text-white shadow-lg`
                : 'bg-dark-800 hover:bg-dark-700'
                }`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-sm font-medium">{mood.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Mood-based recommendations */}
      {selectedMood && moodSongs && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            {moods.find(m => m.id === selectedMood)?.emoji} {moods.find(m => m.id === selectedMood)?.name} Vibes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {moodSongs.slice(0, 12).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trending && trending.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trending.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* AI Daily Mix */}
      {aiRecommendations?.dailyMix && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold">AI Daily Mix</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {aiRecommendations.dailyMix.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Discover Weekly */}
      {aiRecommendations?.discoverWeekly && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold">Discover Weekly</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {aiRecommendations.discoverWeekly.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Because You Listened */}
      {aiRecommendations?.becauseYouListened && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-primary-500" size={24} />
            <h2 className="text-2xl font-bold">Because You Listened</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {aiRecommendations.becauseYouListened.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Fallback: Recent Songs */}
      {recentSongs && (!aiRecommendations || !trending) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">New Releases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
