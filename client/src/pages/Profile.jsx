import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userAPI.getMe().then(res => res.data),
    initialData: user
  });

  const updateMutation = useMutation({
    mutationFn: (data) => userAPI.updateMe(data),
    onSuccess: (response) => {
      updateUser(response.data);
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
    }
  });

  const handleLogout = async () => {
    try {
      await authAPI.logout(useAuthStore.getState().refreshToken);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate({ displayName });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>

      <div className="card mb-6">
        <div className="flex items-start gap-6">
          <img
            src={profile?.avatar}
            alt={profile?.displayName}
            className="w-32 h-32 rounded-full"
          />

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(profile?.displayName || '');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-2">{profile?.displayName}</h2>
                <p className="text-dark-400 mb-4">{profile?.email}</p>
                <button onClick={() => setIsEditing(true)} className="btn-secondary">
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              {profile?.subscriptionTier === 'PREMIUM' && <Crown className="text-yellow-500" size={24} />}
              {profile?.subscriptionTier === 'PREMIUM' ? 'Premium' : 'Free'} Plan
            </h3>
            <p className="text-dark-400">
              {profile?.subscriptionTier === 'PREMIUM'
                ? 'Enjoy ad-free music, offline downloads, and high-quality audio'
                : 'Upgrade to Premium for an enhanced experience'}
            </p>
            {profile?.subscriptionEnd && (
              <p className="text-sm text-dark-500 mt-2">
                Renews on {new Date(profile.subscriptionEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link to="/subscription" className="btn-primary">
            {profile?.subscriptionTier === 'PREMIUM' ? 'Manage' : 'Upgrade'}
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-dark-400">Member since</span>
            <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-dark-400">Account type</span>
            <span className="capitalize">{profile?.role?.toLowerCase()}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary w-full mt-6 flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
