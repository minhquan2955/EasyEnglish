import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, GraduationCap, Chalkboard, ShieldCheck, Users, Heartbeat, CalendarBlank, GenderIntersex, Certificate, Money } from '@phosphor-icons/react';
import api from '../api';

const roleLabels = {
  admin: { label: 'Quản trị viên', icon: ShieldCheck, color: 'text-[#c81b3a]' },
  teacher: { label: 'Giáo viên', icon: Chalkboard, color: 'text-[#0070d1]' },
  student: { label: 'Học sinh', icon: GraduationCap, color: 'text-[#00a854]' },
  parent: { label: 'Phụ huynh', icon: Users, color: 'text-[#f5a623]' },
};

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated && ['student', 'teacher', 'parent'].includes(user.role)) {
      setLoadingProfile(true);
      api.get('/auth/me/profile')
        .then(({ data }) => setProfile(data.profile))
        .catch((err) => console.error('Failed to fetch profile:', err))
        .finally(() => setLoadingProfile(false));
    }
  }, [user, isAuthenticated]);

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
            <InfoRow label="Email" value={user.email} />
            {user.phone && <InfoRow label="Số điện thoại" value={user.phone} />}
            <InfoRow label="Vai trò" value={roleInfo.label} valueClass={roleInfo.color} />
          </div>

          {/* Extended Profile */}
          {loadingProfile && (
            <div className="mt-6 text-sm text-body-light">Đang tải hồ sơ chi tiết...</div>
          )}

          {!loadingProfile && profile && user.role === 'student' && (
            <StudentProfile profile={profile} />
          )}

          {!loadingProfile && profile && user.role === 'teacher' && (
            <TeacherProfile profile={profile} />
          )}

          {!loadingProfile && profile && user.role === 'parent' && (
            <ParentProfile profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function InfoRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-hairline-light">
      <span className="text-[14px] text-body-light">{label}</span>
      <span className={`text-[14px] font-medium text-ink ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mt-8 mb-4 pb-2 border-b border-hairline-light">
      <Icon size={18} weight="fill" className="text-ps-blue" />
      <span className="text-[15px] font-bold text-ink">{title}</span>
    </div>
  );
}

/* ─── Student Profile ─── */

function StudentProfile({ profile }) {
  const genderMap = { male: 'Nam', female: 'Nữ' };

  return (
    <div className="text-left">
      <SectionTitle icon={GraduationCap} title="Hồ sơ Học sinh" />
      <div className="space-y-3">
        <InfoRow label="Mã Học sinh" value={profile.studentCode || '—'} />
        <InfoRow
          label="Ngày sinh"
          value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : '—'}
        />
        <InfoRow label="Giới tính" value={genderMap[profile.gender] || '—'} />
      </div>

      {/* Enrolled Classes */}
      {profile.enrolledClasses && profile.enrolledClasses.length > 0 && (
        <>
          <SectionTitle icon={Chalkboard} title="Lớp đang học" />
          <div className="flex flex-wrap gap-2">
            {profile.enrolledClasses.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-ps-blue/10 text-ps-blue border border-ps-blue/20"
              >
                <Chalkboard size={12} />
                {code}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Emergency Contact */}
      {profile.emergencyContact && (profile.emergencyContact.name || profile.emergencyContact.phone) && (
        <>
          <SectionTitle icon={Heartbeat} title="Liên hệ khẩn cấp" />
          <div className="space-y-3">
            {profile.emergencyContact.name && (
              <InfoRow label="Người liên hệ" value={profile.emergencyContact.name} />
            )}
            {profile.emergencyContact.phone && (
              <InfoRow label="Số điện thoại" value={profile.emergencyContact.phone} />
            )}
            {profile.emergencyContact.relation && (
              <InfoRow label="Quan hệ" value={profile.emergencyContact.relation} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Teacher Profile ─── */

function TeacherProfile({ profile }) {
  const salaryTypeMap = { hourly: 'Theo giờ', fixed: 'Cố định' };

  return (
    <div className="text-left">
      <SectionTitle icon={Chalkboard} title="Hồ sơ Giáo viên" />
      <div className="space-y-3">
        <InfoRow label="Mã Giáo viên" value={profile.employeeCode || '—'} />
        <InfoRow
          label="Ngày vào làm"
          value={profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('vi-VN') : '—'}
        />
      </div>

      {/* Specializations */}
      {profile.specializations && profile.specializations.length > 0 && (
        <>
          <SectionTitle icon={GraduationCap} title="Chuyên môn" />
          <div className="flex flex-wrap gap-2">
            {profile.specializations.map((spec, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#00a854]/10 text-[#00a854] border border-[#00a854]/20"
              >
                {spec}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <>
          <SectionTitle icon={Certificate} title="Chứng chỉ" />
          <div className="space-y-3">
            {profile.certifications.map((cert, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-hairline-light">
                <span className="text-[14px] text-ink font-medium">{cert.name}</span>
                <span className="text-[13px] text-body-light">
                  {cert.issuedBy}{cert.year ? ` (${cert.year})` : ''}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Salary */}
      {profile.salary && (
        <>
          <SectionTitle icon={Money} title="Thông tin lương" />
          <div className="space-y-3">
            <InfoRow label="Loại lương" value={salaryTypeMap[profile.salary.type] || profile.salary.type || '—'} />
            <InfoRow
              label="Mức lương"
              value={profile.salary.amount ? `${profile.salary.amount.toLocaleString()} đ` : '—'}
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Parent Profile ─── */

function ParentProfile({ profile }) {
  const relationMap = { father: 'Bố', mother: 'Mẹ', guardian: 'Người giám hộ' };

  return (
    <div className="text-left">
      <SectionTitle icon={Users} title="Hồ sơ Phụ huynh" />
      <div className="space-y-3">
        <InfoRow label="Mối quan hệ" value={relationMap[profile.relationship] || profile.relationship || '—'} />
      </div>

      {/* Linked Students */}
      {profile.studentIds && profile.studentIds.length > 0 && (
        <>
          <SectionTitle icon={GraduationCap} title="Các con (Học sinh liên kết)" />
          <div className="space-y-3">
            {profile.studentIds.map((student) => (
              <div key={student._id} className="flex justify-between items-center py-3 border-b border-hairline-light">
                <span className="text-[14px] text-ink font-medium">
                  {student.userId?.fullName || 'Không rõ tên'}
                </span>
                <span className="text-[13px] text-body-light">
                  {student.userId?.email || '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
