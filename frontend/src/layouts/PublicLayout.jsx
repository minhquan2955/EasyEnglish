import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-canvas-light font-sans text-ink flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
