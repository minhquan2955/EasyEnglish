import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, GraduationCap, Chalkboard, ShieldCheck, Users } from '@phosphor-icons/react';

const roleLabels = {
  admin: { label: 'Quản trị viên', icon: ShieldCheck, color: 'text-[#c81b3a]' },
  teacher: { label: 'Giáo viên', icon: Chalkboard, color: 'text-[#0070d1]' },
  student: { label: 'Học sinh', icon: GraduationCap, color: 'text-[#00a854]' },
  parent: { label: 'Phụ huynh', icon: Users, color: 'text-[#f5a623]' },
};

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12">
        <div className="text-body-light text-[18px]">Đang tải...</div>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12">
        <div className="text-body-light text-[18px]">Vui lòng đăng nhập để xem hồ sơ.</div>
      </div>
    );
  }

  const roleInfo = roleLabels[user.role] || { label: user.role, icon: UserCircle, color: 'text-ink' };
  const RoleIcon = roleInfo.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12">
      <div className="w-full max-w-[520px]">

        {/* Profile Card */}
        <div className="bg-surface-card rounded-[8px] border border-hairline-light p-8 text-center">

          {/* Avatar */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ps-blue/10 flex items-center justify-center">
            <UserCircle size={48} weight="fill" className="text-ps-blue" />
          </div>

          {/* Greeting */}
          <h1 className="font-display font-light text-[28px] tracking-[0.1px] text-ink leading-[1.25]">
            Trang cá nhân của {user.fullName}
          </h1>

          {/* Role Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-canvas-light border border-hairline-light">
            <RoleIcon size={18} weight="fill" className={roleInfo.color} />
            <span className="text-[14px] font-bold tracking-[0.324px] text-ink">
              {roleInfo.label}
            </span>
          </div>

          {/* User Info */}
          <div className="mt-8 space-y-3 text-left">
            <div className="flex justify-between items-center py-3 border-b border-hairline-light">
              <span className="text-[14px] text-body-light">Email</span>
              <span className="text-[14px] font-medium text-ink">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex justify-between items-center py-3 border-b border-hairline-light">
                <span className="text-[14px] text-body-light">Số điện thoại</span>
                <span className="text-[14px] font-medium text-ink">{user.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-hairline-light">
              <span className="text-[14px] text-body-light">Vai trò</span>
              <span className={`text-[14px] font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
