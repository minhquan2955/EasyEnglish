import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

/**
 * AuthProvider — quản lý trạng thái đăng nhập
 * Đọc từ localStorage khi khởi tạo, validate token với backend
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo auth state từ localStorage + validate token với backend
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          // Không có token → chưa đăng nhập
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Có token → validate với backend bằng GET /auth/me
        const { data } = await api.get('/auth/me');
        // Token hợp lệ → cập nhật user từ backend (luôn mới nhất)
        const freshUser = {
          _id: data._id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          phone: data.phone,
        };
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
        setIsAuthenticated(true);
      } catch {
        // Token hết hạn hoặc không hợp lệ → xóa và đăng xuất
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();

    // Listen for auth changes (from Login page, 401 interceptor, or other tabs)
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook để sử dụng auth context
 * @returns {{ user, isAuthenticated, isLoading, login, logout }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
