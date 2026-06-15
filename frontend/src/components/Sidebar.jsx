import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Gauge, 
  Users, 
  ChalkboardTeacher, 
  UsersThree, 
  Chalkboard, 
  Calendar, 
  ClipboardText,
  SignOut,
  User,
  IdentificationCard,
  CheckSquareOffset,
  Books,
  EnvelopeSimple
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

const getSidebarItems = (role) => {
  const baseItems = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (role === 'admin') {
    return [
      { name: 'Dashboard', path: '/dashboard', icon: Gauge },
      ...baseItems,
      { name: 'Account', path: '/account', icon: IdentificationCard },
      { name: 'Courses', path: '/quan-ly-khoa-hoc', icon: Books },
      { name: 'Class', path: '/quan-ly-lop-hoc', icon: Chalkboard },
      { name: 'Students', path: '/quan-ly-hoc-sinh', icon: Users },
      { name: 'Teachers', path: '/quan-ly-giao-vien', icon: ChalkboardTeacher },
      { name: 'Parents', path: '/quan-ly-phu-huynh', icon: UsersThree },
      { name: 'Class Routine', path: '/quan-ly-lich-hoc', icon: Calendar },
      { name: 'Exam & Grades', path: '/quan-ly-ky-thi', icon: ClipboardText },
      { name: 'Attendance', path: '/quan-ly-diem-danh', icon: CheckSquareOffset },
      { name: 'Enrollment', path: '/quan-ly-ghi-danh', icon: IdentificationCard },
      { name: 'Registration', path: '/quan-ly-dang-ky', icon: EnvelopeSimple },
    ];
  }

  if (role === 'teacher') {
    return [
      ...baseItems,
      { name: 'My Classes', path: '/quan-ly-lop-hoc', icon: Chalkboard },
      { name: 'Class Routine', path: '/quan-ly-lich-hoc', icon: Calendar },
      { name: 'Exam & Grades', path: '/quan-ly-ky-thi', icon: ClipboardText },
      { name: 'Attendance', path: '/quan-ly-diem-danh', icon: CheckSquareOffset },
    ];
  }

  if (role === 'student') {
    return [
      ...baseItems,
      { name: 'My Schedule', path: '/my-schedule', icon: Calendar },
      { name: 'My Grades', path: '/my-grades', icon: ClipboardText },
      { name: 'My Attendance', path: '/my-attendance', icon: CheckSquareOffset },
    ];
  }

  if (role === 'parent') {
    return [
      ...baseItems,
      { name: "Children's Schedule", path: '/children-schedule', icon: Calendar },
      { name: "Children's Grades", path: '/children-grades', icon: ClipboardText },
      { name: "Children's Attendance", path: '/children-attendance', icon: CheckSquareOffset },
    ];
  }

  return baseItems;
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = getSidebarItems(user?.role);

  return (
    <aside className="w-64 h-screen bg-canvas-dark text-on-dark flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-center border-b border-surface-dark-card shrink-0 bg-ps-blue">
        <span className="font-display font-light text-[22px] tracking-tight text-on-dark">
          EasyEnglish
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4">
        <ul className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive 
                      ? 'bg-surface-dark-elevated text-ps-blue border-l-4 border-ps-blue' 
                      : 'text-on-dark/80 hover:bg-surface-dark-card hover:text-on-dark border-l-4 border-transparent'
                  }`}
                >
                  <Icon size={20} weight={isActive ? "fill" : "regular"} className={isActive ? 'text-ps-blue' : 'text-ps-blue/80'} />
                  <span className="text-[15px] font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-surface-dark-card mt-auto flex flex-col gap-3">
        {user && (
          <div className="flex flex-col gap-1 px-2">
            <span className="text-[14px] font-medium truncate">{user.fullName}</span>
            <span className="text-[12px] text-on-dark/60 truncate">{user.role}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 py-2 text-[14px] text-on-dark/80 hover:text-on-dark hover:bg-surface-dark-card rounded-md transition-colors w-full text-left"
        >
          <SignOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
