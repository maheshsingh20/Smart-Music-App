import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../services/api';
import { Plus, Music } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistAPI } from '../services/api';

export default function Library() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => userAPI.getPlaylists().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (name) => playlistAPI.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      setIsCreateOpen(false);
      setPlaylistName('');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (playlistName.trim()) {
      createMutation.mutate(playlistName);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Library</h1>

        <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Dialog.Trigger asChild>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              Create Playlist
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-900 rounded-lg p-6 w-full max-w-md border border-dark-800">
              <Dialog.Title className="text-2xl font-bold mb-4">
                Create Playlist
              </Dialog.Title>

              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="input mb-4"
                  autoFocus
                />

                <div className="flex gap-2 justify-end">
                  <Dialog.Close asChild>
                    <button type="button" className="btn-secondary">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={!playlistName.trim() || createMutation.isPending}
                    className="btn-primary"
                  >
                    Create
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Link to="/liked-songs" className="card group">
          <div className="w-full aspect-square bg-gradient-to-br from-primary-600 to-primary-800 rounded flex items-center justify-center mb-3">
            <Music size={48} />
          </div>
          <h3 className="font-semibold">Liked Songs</h3>
          <p className="text-sm text-dark-400">Your favorites</p>
        </Link>

        {playlists.map((playlist) => (
          <Link key={playlist.id} to={`/playlist/${playlist.id}`} className="card group">
            <div className="relative mb-3">
              <img
                src={playlist.cover}
                alt={playlist.name}
                className="w-full aspect-square object-cover rounded"
              />
            </div>
            <h3 className="font-semibold truncate">{playlist.name}</h3>
            <p className="text-sm text-dark-400">
              {playlist.songs?.length || 0} songs
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
