import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-canvas-light font-sans text-ink">
      {/* Sidebar fixed on the left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
