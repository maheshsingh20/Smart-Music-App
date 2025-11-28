import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';

export default function Layout() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
      </div>
      <PlayerBar />
    </div>
  );
}
