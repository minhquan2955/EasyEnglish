import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Chờ AuthContext khởi tạo xong (đọc localStorage)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas-light">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-ps-blue border-t-transparent" />
      </div>
    );
  }

  // Chưa đăng nhập → redirect về trang login
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

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
