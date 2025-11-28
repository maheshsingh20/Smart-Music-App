import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import { Shield, Trash2 } from 'lucide-react';

export default function Admin() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.getUsers().then(res => res.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
    }
  });

  const handleRoleChange = (userId, newRole) => {
    updateMutation.mutate({ id: userId, data: { role: newRole } });
  };

  const handleTierChange = (userId, newTier) => {
    updateMutation.mutate({ id: userId, data: { subscriptionTier: newTier } });
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={32} className="text-primary-500" />
        <h1 className="text-4xl font-bold">Admin Panel</h1>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>

        {isLoading ? (
          <p className="text-dark-400">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Subscription</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-dark-800 hover:bg-dark-800">
                    <td className="py-3 px-4">
                      <div className="font-medium">{user.displayName}</div>
                    </td>
                    <td className="py-3 px-4 text-dark-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-dark-900 border border-dark-700 rounded px-2 py-1 text-sm"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.subscriptionTier}
                        onChange={(e) => handleTierChange(user.id, e.target.value)}
                        className="bg-dark-900 border border-dark-700 rounded px-2 py-1 text-sm"
                      >
                        <option value="FREE">Free</option>
                        <option value="PREMIUM">Premium</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-dark-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          if (confirm(`Delete user ${user.displayName}?`)) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        aria-label="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-4xl font-bold text-primary-500">{users.length}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Premium Users</h3>
          <p className="text-4xl font-bold text-primary-500">
            {users.filter(u => u.subscriptionTier === 'PREMIUM').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Admins</h3>
          <p className="text-4xl font-bold text-primary-500">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>
    </div>
  );
}
