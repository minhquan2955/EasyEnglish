import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, UserCircle, Globe } from '@phosphor-icons/react';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-canvas-dark text-on-dark h-[64px] flex items-center z-50">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-center w-full">
          
          {/* Logo & Lang */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display font-light text-[22px] tracking-tight text-on-dark">
                EasyEnglish
              </span>
            </Link>
            
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

            {['Hệ thống trung tâm', 'Tin tức & sự kiện', 'Góc phụ huynh'].map((item) => (
              <li key={item}>
                <a href="#" className="text-on-dark/80 hover:text-on-dark transition-colors py-2 block">
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="hidden sm:flex">
            <a 
              href="#" 
              className="flex items-center gap-2 bg-ps-blue text-on-dark px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors hover:bg-ps-blue-pressed"
            >
              <span>Đăng nhập My EasyEnglish</span>
              <UserCircle size={20} weight="fill" />
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}
