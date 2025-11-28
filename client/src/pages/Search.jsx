import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import SongCard from '../components/SongCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    mood: ''
  });

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', initialQuery, filters],
    queryFn: () => searchAPI.search({ q: initialQuery, ...filters }).then(res => res.data),
    enabled: !!initialQuery
  });

  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical'];
  const moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Romantic'];
  const years = [2024, 2023, 2022, 2021, 2020];

  return (
    <div className="p-8">
      <div className="max-w-2xl mb-8">
        <SearchBar autoFocus />
      </div>

      {initialQuery && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  value={filters.genre}
                  onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                  className="input w-40"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="input w-32"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mood</label>
                <select
                  value={filters.mood}
                  onChange={(e) => setFilters({ ...filters, mood: e.target.value })}
                  className="input w-40"
                >
                  <option value="">All Moods</option>
                  {moods.map((mood) => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">
              {isLoading ? 'Searching...' : `Results for "${initialQuery}"`}
            </h2>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {results.map((song) => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            ) : !isLoading && (
              <p className="text-dark-400">No results found</p>
            )}
          </div>
        </>
      )}

      {!initialQuery && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">Search for music</h2>
          <p className="text-dark-400">Find your favorite songs, artists, and albums</p>
        </div>
      )}
    </div>
  );
}
