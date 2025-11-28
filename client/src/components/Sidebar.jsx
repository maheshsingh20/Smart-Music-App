import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, User, Settings, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const { user } = useAuthStore();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/library', icon: Library, label: 'Library' },
    { to: '/liked-songs', icon: Heart, label: 'Liked Songs' },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-500">MusicStream</h1>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-dark-800 text-primary-500'
                : 'text-dark-300 hover:text-dark-50 hover:bg-dark-800'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-1 border-t border-dark-800">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
              ? 'bg-dark-800 text-primary-500'
              : 'text-dark-300 hover:text-dark-50 hover:bg-dark-800'
            }`
          }
        >
          <User size={20} />
          <span className="font-medium">Profile</span>
        </NavLink>

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-dark-800 text-primary-500'
                : 'text-dark-300 hover:text-dark-50 hover:bg-dark-800'
              }`
            }
          >
            <Shield size={20} />
            <span className="font-medium">Admin</span>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
