import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ onSearch, autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggestions', query],
    queryFn: () => searchAPI.getSuggestions(query).then(res => res.data),
    enabled: query.length >= 2
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && onSearch) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search songs, artists, albums..."
            className="input pl-12 pr-4"
            autoFocus={autoFocus}
          />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-dark-900 border border-dark-700 rounded-lg shadow-xl z-50">
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(item.title)}`);
                setQuery(item.title);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-dark-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-dark-400">{item.type}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
