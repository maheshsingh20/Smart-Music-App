import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { artistAPI } from '../services/api';
import SongCard from '../components/SongCard';
import { Play, UserPlus } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export default function Artist() {
  const { id } = useParams();
  const { setQueue } = usePlayerStore();

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistAPI.get(id).then(res => res.data)
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!artist) {
    return <div className="p-8">Artist not found</div>;
  }

  const handlePlayAll = () => {
    if (artist.topTracks?.length > 0) {
      setQueue(artist.topTracks, 0);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-end gap-6 mb-8">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-48 h-48 rounded-full object-cover"
        />

        <div>
          <p className="text-sm font-semibold uppercase mb-2">Artist</p>
          <h1 className="text-6xl font-bold mb-4">{artist.name}</h1>
          <div className="flex items-center gap-4">
            <button onClick={handlePlayAll} className="btn-primary flex items-center gap-2">
              <Play size={20} fill="white" />
              Play
            </button>
            <button className="btn-secondary flex items-center gap-2">
              <UserPlus size={20} />
              Follow
            </button>
          </div>
        </div>
      </div>

      {artist.bio && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-dark-300 max-w-3xl">{artist.bio}</p>
        </div>
      )}

      {artist.topTracks && artist.topTracks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>
          <div className="space-y-2">
            {artist.topTracks.slice(0, 10).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-3 rounded hover:bg-dark-800 transition-colors group cursor-pointer"
                onClick={() => setQueue(artist.topTracks, index)}
              >
                <span className="text-dark-400 w-8 text-center">{index + 1}</span>
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-dark-400">{song.playCount?.toLocaleString()} plays</p>
                </div>
                <span className="text-sm text-dark-400">
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {artist.albums && artist.albums.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {artist.albums.map((album) => (
              <div key={album.id} className="card">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full aspect-square object-cover rounded mb-3"
                />
                <h3 className="font-semibold truncate">{album.title}</h3>
                <p className="text-sm text-dark-400">{album.releaseYear}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {artist.relatedArtists && artist.relatedArtists.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Similar Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {artist.relatedArtists.map((relatedArtist) => (
              <div key={relatedArtist.id} className="card">
                <img
                  src={relatedArtist.image}
                  alt={relatedArtist.name}
                  className="w-full aspect-square object-cover rounded-full mb-3"
                />
                <h3 className="font-semibold truncate">{relatedArtist.name}</h3>
                <p className="text-sm text-dark-400">Artist</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
