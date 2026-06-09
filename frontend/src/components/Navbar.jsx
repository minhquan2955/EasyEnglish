import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CaretDown, UserCircle, Globe, SignOut, User } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="w-full bg-canvas-dark text-on-dark h-[64px] flex items-center z-50">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-center w-full">
          
          {/* Logo & Lang */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 group cursor-default">
                <span className="font-display font-light text-[22px] tracking-tight text-on-dark">
                  EasyEnglish
                </span>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-2 group">
                <span className="font-display font-light text-[22px] tracking-tight text-on-dark">
                  EasyEnglish
                </span>
              </Link>
            )}
            
            <div className="hidden md:flex items-center gap-1.5 text-sm font-medium text-on-dark/80 hover:text-on-dark transition-colors cursor-pointer">
              <Globe size={16} />
              <span>EN</span>
            </div>
          </div>

          {/* Nav Links */}
          <ul className="hidden lg:flex items-center gap-6 text-[16px] font-medium">
            <li className="relative group">
              <Link to="/about" className="text-on-dark/80 hover:text-on-dark transition-colors py-2 flex items-center gap-1">
                Về EasyEnglish
              </Link>
            </li>

            {/* Dropdown Menu */}
            <li 
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button 
                className={`flex items-center gap-1.5 py-2 transition-colors ${isDropdownOpen ? 'text-on-dark' : 'text-on-dark/80 hover:text-on-dark'}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Chương trình học
                <CaretDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Content */}
              <div 
                className={`absolute top-full left-0 mt-2 w-56 bg-surface-dark-card rounded-md overflow-hidden transition-all duration-200 origin-top-left ${
                  isDropdownOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                }`}
              >
                <div className="p-1 flex flex-col">
                  {[
                    { name: 'Tiếng Anh Mẫu giáo', path: '/tieng-anh-mau-giao' },
                    { name: 'Tiếng Anh Thiếu nhi', path: '/tieng-anh-thieu-nhi' },
                    { name: 'Tiếng Anh Thiếu niên', path: '/tieng-anh-thieu-nien' },
                    { name: 'IELTS', path: '/tieng-anh-ielts' }
                  ].map((course) => (
                    <Link 
                      key={course.name}
                      to={course.path} 
                      className="px-4 py-2.5 text-[14px] text-on-dark/80 hover:bg-surface-dark-elevated hover:text-on-dark transition-colors rounded-sm"
                    >
                      {course.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            <li>
              <Link to="/he-thong-trung-tam" className="text-on-dark/80 hover:text-on-dark transition-colors py-2 block">
                Hệ thống trung tâm
              </Link>
            </li>
            <li>
              <Link to="/tin-tuc-va-su-kien" className="text-on-dark/80 hover:text-on-dark transition-colors py-2 block">
                Tin tức & sự kiện
              </Link>
            </li>
            <li>
              <Link to="/goc-phu-huynh" className="text-on-dark/80 hover:text-on-dark transition-colors py-2 block">
                Góc phụ huynh
              </Link>
            </li>
          </ul>

          {/* CTA / User Area */}
          <div className="hidden sm:flex">
            {isAuthenticated && user ? (
              /* Authenticated: User Menu */
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-ps-blue text-on-dark px-4 py-2 rounded-full font-bold text-[14px] transition-colors hover:bg-ps-blue-pressed"
                >
                  <UserCircle size={22} weight="fill" />
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                  <CaretDown size={12} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                <div
                  className={`absolute top-full right-0 mt-2 w-52 bg-surface-dark-card rounded-md overflow-hidden transition-all duration-200 origin-top-right ${
                    isUserMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'
                  }`}
                >
                  <div className="p-1 flex flex-col">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-hairline-dark">
                      <p className="text-[14px] font-medium text-on-dark truncate">{user.fullName}</p>
                      <p className="text-[12px] text-on-dark/60 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="px-4 py-2.5 text-[14px] text-on-dark/80 hover:bg-surface-dark-elevated hover:text-on-dark transition-colors rounded-sm flex items-center gap-2"
                    >
                      <User size={16} />
                      Trang cá nhân
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 text-[14px] text-on-dark/80 hover:bg-surface-dark-elevated hover:text-on-dark transition-colors rounded-sm flex items-center gap-2 w-full text-left"
                    >
                      <SignOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Not authenticated: Login button */
              <Link 
                to="/dang-nhap"
                className="flex items-center gap-2 bg-ps-blue text-on-dark px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors hover:bg-ps-blue-pressed"
              >
                <span>Đăng nhập My EasyEnglish</span>
                <UserCircle size={20} weight="fill" />
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

