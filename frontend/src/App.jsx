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
import Dashboard from "./pages/Dashboard";
import Course from "./pages/Course";
import Class from "./pages/Class";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";
import Parent from "./pages/Parent";
import Schedule from "./pages/Schedule";
import Grade from "./pages/Grade";
import Enrollment from "./pages/Enrollment";
import RegistrationManagement from "./pages/RegistrationManagement";
import MySchedule from "./pages/MySchedule";
import MyGrades from "./pages/MyGrades";
import ChildrenSchedule from "./pages/ChildrenSchedule";
import ChildrenGrades from "./pages/ChildrenGrades";
import Attendance from "./pages/Attendance";
import MyAttendance from "./pages/MyAttendance";
import ChildrenAttendance from "./pages/ChildrenAttendance";

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          {/* Admin & Shared Management Routes */}
          <Route path="/quan-ly-khoa-hoc" element={<Course />} />
          <Route path="/quan-ly-lop-hoc" element={<Class />} />
          <Route path="/quan-ly-lich-hoc" element={<Schedule />} />
          <Route path="/quan-ly-nguoi-dung" element={<div className="p-4">Quản lý người dùng (Coming soon)</div>} />
          <Route path="/quan-ly-hoc-sinh" element={<Student />} />
          <Route path="/quan-ly-giao-vien" element={<Teacher />} />
          <Route path="/quan-ly-phu-huynh" element={<Parent />} />
          <Route path="/quan-ly-ky-thi" element={<Grade />} />
          <Route path="/quan-ly-diem-danh" element={<Attendance />} />
          <Route path="/quan-ly-ghi-danh" element={<Enrollment />} />
          <Route path="/quan-ly-dang-ky" element={<RegistrationManagement />} />

          {/* Student Specific Routes */}
          <Route path="/my-schedule" element={<MySchedule />} />
          <Route path="/my-grades" element={<MyGrades />} />
          <Route path="/my-attendance" element={<MyAttendance />} />

          {/* Parent Specific Routes */}
          <Route path="/children-schedule" element={<ChildrenSchedule />} />
          <Route path="/children-grades" element={<ChildrenGrades />} />
          <Route path="/children-attendance" element={<ChildrenAttendance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
