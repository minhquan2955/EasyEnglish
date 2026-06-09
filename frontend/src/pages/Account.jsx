import { useState } from 'react';
import { UserPlus, IdentificationCard, EnvelopeSimple, Phone, Lock, Tag } from '@phosphor-icons/react';

export default function Account() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'student'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đã có lỗi xảy ra khi tạo tài khoản');
      }

      setSuccess(`Tạo tài khoản thành công cho ${data.fullName} (${data.email})!`);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'student'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-10 min-h-full">
      <div className="w-full max-w-2xl bg-surface-card rounded-[8px] border border-hairline-light p-8 shadow-sm">
        
        <div className="flex items-center gap-3 mb-6 border-b border-hairline-light pb-4">
          <div className="w-10 h-10 rounded-full bg-ps-blue/10 flex items-center justify-center">
            <UserPlus size={24} weight="fill" className="text-ps-blue" />
          </div>
          <h1 className="font-display font-medium text-[24px] text-ink">
            Tạo Tài Khoản Mới
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] rounded-[4px] text-[14px]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#00a854]/10 border border-[#00a854]/20 text-[#00a854] rounded-[4px] text-[14px]">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Họ và tên */}
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-body-light">
                <IdentificationCard size={20} />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Nhập họ và tên..."
                className="w-full h-[48px] pl-10 pr-4 bg-canvas-light border border-hairline-light rounded-[4px] text-[16px] text-ink placeholder:text-body-light focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-body-light">
                <EnvelopeSimple size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@email.com"
                className="w-full h-[48px] pl-10 pr-4 bg-canvas-light border border-hairline-light rounded-[4px] text-[16px] text-ink placeholder:text-body-light focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-[14px] font-medium text-ink mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-body-light">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0123 456 789"
                  className="w-full h-[48px] pl-10 pr-4 bg-canvas-light border border-hairline-light rounded-[4px] text-[16px] text-ink placeholder:text-body-light focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-[14px] font-medium text-ink mb-1">
                Vai trò (Role)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-body-light">
                  <Tag size={20} />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full h-[48px] pl-10 pr-4 bg-canvas-light border border-hairline-light rounded-[4px] text-[16px] text-ink focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                >
                  <option value="student">Học sinh</option>
                  <option value="parent">Phụ huynh</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="admin">Quản trị viên</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-body-light">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[14px] font-medium text-ink mb-1">
              Mật khẩu khởi tạo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-body-light">
                <Lock size={20} />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Nhập mật khẩu ít nhất 6 ký tự..."
                className="w-full h-[48px] pl-10 pr-4 bg-canvas-light border border-hairline-light rounded-[4px] text-[16px] text-ink placeholder:text-body-light focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
              />
            </div>
            <p className="mt-1 text-[12px] text-body-light">Mật khẩu này sẽ được gửi cho người dùng để họ đăng nhập lần đầu.</p>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-ps-blue text-on-dark rounded-[4px] font-bold text-[16px] hover:bg-ps-blue-pressed active:bg-ps-blue-active transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <UserPlus size={20} weight="bold" />
                  Tạo tài khoản
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
