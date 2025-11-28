import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Artist from './pages/Artist';
import Playlist from './pages/Playlist';
import LikedSongs from './pages/LikedSongs';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';

function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="library" element={<Library />} />
        <Route path="profile" element={<Profile />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="artist/:id" element={<Artist />} />
        <Route path="playlist/:id" element={<Playlist />} />
        <Route path="liked-songs" element={<LikedSongs />} />
        <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>
    </Routes>
  );
}
