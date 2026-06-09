import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import ChildrenEnglish from "./pages/ChildrenEnglish";
import KindergartenEnglish from "./pages/KindergartenEnglish";
import TeenEnglish from "./pages/TeenEnglish";
import IeltsEnglish from "./pages/IeltsEnglish";
import Centers from "./pages/Centers";
import NewsAndEvents from "./pages/NewsAndEvents";
import ParentsCorner from "./pages/ParentsCorner";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Top Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/tieng-anh-mau-giao" element={<KindergartenEnglish />} />
          <Route path="/tieng-anh-thieu-nhi" element={<ChildrenEnglish />} />
          <Route path="/tieng-anh-thieu-nien" element={<TeenEnglish />} />
          <Route path="/tieng-anh-ielts" element={<IeltsEnglish />} />
          <Route path="/he-thong-trung-tam" element={<Centers />} />
          <Route path="/tin-tuc-va-su-kien" element={<NewsAndEvents />} />
          <Route path="/goc-phu-huynh" element={<ParentsCorner />} />
          <Route path="/dang-nhap" element={<Login />} />
        </Route>

        {/* Authenticated Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<div className="p-4">Trang tổng quan (Coming soon)</div>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          {/* Admin & Shared Management Routes */}
          <Route path="/quan-ly-khoa-hoc" element={<div className="p-4">Quản lý khóa học (Coming soon)</div>} />
          <Route path="/quan-ly-lop-hoc" element={<div className="p-4">Quản lý lớp học (Coming soon)</div>} />
          <Route path="/quan-ly-lich-hoc" element={<div className="p-4">Quản lý lịch học (Coming soon)</div>} />
          <Route path="/quan-ly-nguoi-dung" element={<div className="p-4">Quản lý người dùng (Coming soon)</div>} />
          <Route path="/quan-ly-hoc-sinh" element={<div className="p-4">Quản lý học sinh (Coming soon)</div>} />
          <Route path="/quan-ly-giao-vien" element={<div className="p-4">Quản lý giáo viên (Coming soon)</div>} />
          <Route path="/quan-ly-phu-huynh" element={<div className="p-4">Quản lý phụ huynh (Coming soon)</div>} />
          <Route path="/quan-ly-ky-thi" element={<div className="p-4">Quản lý kỳ thi (Coming soon)</div>} />
          <Route path="/quan-ly-diem-danh" element={<div className="p-4">Quản lý điểm danh (Coming soon)</div>} />
          <Route path="/quan-ly-ghi-danh" element={<div className="p-4">Quản lý ghi danh (Coming soon)</div>} />

          {/* Student Specific Routes */}
          <Route path="/my-schedule" element={<div className="p-4">Lịch học của tôi (Coming soon)</div>} />
          <Route path="/my-grades" element={<div className="p-4">Bảng điểm của tôi (Coming soon)</div>} />
          <Route path="/my-attendance" element={<div className="p-4">Lịch sử điểm danh (Coming soon)</div>} />

          {/* Parent Specific Routes */}
          <Route path="/children-schedule" element={<div className="p-4">Lịch học của con (Coming soon)</div>} />
          <Route path="/children-grades" element={<div className="p-4">Điểm số của con (Coming soon)</div>} />
          <Route path="/children-attendance" element={<div className="p-4">Điểm danh của con (Coming soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
