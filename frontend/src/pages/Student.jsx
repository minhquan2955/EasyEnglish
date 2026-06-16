import { useState, useEffect } from 'react';
import { UserSquare, Plus, IdentificationBadge, EnvelopeSimple, Phone, LockKey, CalendarBlank, GenderIntersex, Heartbeat, PencilSimple, Tag, Chalkboard } from '@phosphor-icons/react';

export default function Student() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    studentCode: '',
    dateOfBirth: '',
    gender: 'male',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStudents = async () => {
    setLoadingList(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/students?limit=200', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') fetchStudents();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      fullName: student.userId?.fullName || '',
      email: student.userId?.email || '',
      phone: student.userId?.phone || '',
      password: '',
      studentCode: student.studentCode || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender || 'male',
      emergencyName: student.emergencyContact?.name || '',
      emergencyPhone: student.emergencyContact?.phone || '',
      emergencyRelation: student.emergencyContact?.relation || '',
      status: student.userId?.status || 'active'
    });
    setError('');
    setSuccess('');
    setActiveTab('create');
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      studentCode: '',
      dateOfBirth: '',
      gender: 'male',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelation: '',
      status: 'active'
    });
    setError('');
    setSuccess('');
    setActiveTab('create');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        studentCode: formData.studentCode,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation
        }
      };

      if (!editingId && formData.password) {
        payload.password = formData.password;
      }
      if (editingId) {
        payload.status = formData.status;
      }

      const endpoint = editingId ? `/api/admin/students/${editingId}` : '/api/admin/students';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (editingId ? 'Lỗi khi cập nhật học sinh' : 'Lỗi khi tạo học sinh'));
      }

      setSuccess(editingId ? `Cập nhật học sinh thành công!` : `Tạo học sinh thành công!`);
      
      if (!editingId) {
        handleCreateNew(); // Reset form
        setSuccess(`Tạo học sinh thành công!`); // Restore success message after reset
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl mb-2 text-white" style={{ fontWeight: 300, letterSpacing: '0.1px' }}>
            Quản lý Học sinh
          </h1>
          <p className="text-gray-400">Xem danh sách học sinh và thêm hồ sơ mới.</p>
        </div>

        <div className="flex bg-black p-1 rounded-full border border-gray-800">
          <button
            onClick={() => { setActiveTab('list'); setEditingId(null); }}
            className="px-6 py-2 text-sm transition-all duration-200"
            style={{
              borderRadius: '9999px',
              backgroundColor: activeTab === 'list' ? '#0070d1' : 'transparent',
              color: activeTab === 'list' ? '#ffffff' : '#a1a1aa',
              fontWeight: activeTab === 'list' ? 500 : 400
            }}
          >
            Danh sách
          </button>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2 text-sm transition-all duration-200"
            style={{
              borderRadius: '9999px',
              backgroundColor: activeTab === 'create' ? '#0070d1' : 'transparent',
              color: activeTab === 'create' ? '#ffffff' : '#a1a1aa',
              fontWeight: activeTab === 'create' ? 500 : 400
            }}
          >
            {editingId ? 'Chỉnh sửa' : 'Tạo mới'}
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserSquare size={24} className="text-ps-blue" />
            <h2 className="text-xl" style={{ fontWeight: 300 }}>Danh sách Học sinh</h2>
          </div>

          {loadingList ? (
            <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Mã HS</th>
                    <th className="pb-3 font-medium">Họ và tên</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Giới tính</th>
                    <th className="pb-3 font-medium">Lớp đang học</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        Chưa có học sinh nào.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                        <td className="py-4 text-white font-medium">{st.studentCode}</td>
                        <td className="py-4 text-gray-300">{st.userId?.fullName || '-'}</td>
                        <td className="py-4 text-gray-400">{st.userId?.email || '-'}</td>
                        <td className="py-4 text-gray-400">{st.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                        <td className="py-4">
                          {st.enrolledClasses && st.enrolledClasses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {st.enrolledClasses.map((code) => (
                                <span
                                  key={code}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-medium bg-ps-blue/10 text-ps-blue border border-ps-blue/20"
                                >
                                  <Chalkboard size={12} />
                                  {code}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs italic">Chưa có lớp</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-[4px] text-xs font-medium ${
                            st.userId?.status === 'active' ? 'bg-[#00a854]/10 text-[#00a854]' : 'bg-[#c81b3a]/10 text-[#c81b3a]'
                          }`}>
                            {st.userId?.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleEdit(st)}
                            className="p-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors inline-flex"
                            title="Sửa thông tin"
                          >
                            <PencilSimple size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-ps-blue/20 flex items-center justify-center">
              {editingId ? <PencilSimple size={24} weight="fill" className="text-ps-blue" /> : <Plus size={24} weight="bold" className="text-ps-blue" />}
            </div>
            <h2 className="text-2xl text-white" style={{ fontWeight: 300 }}>
              {editingId ? 'Chỉnh Sửa Học Sinh' : 'Tạo Hồ Sơ Học Sinh'}
            </h2>
          </div>

          {error && <div className="mb-6 p-4 bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] rounded-[4px] text-sm">{error}</div>}
          {success && <div className="mb-6 p-4 bg-[#00a854]/10 border border-[#00a854]/20 text-[#00a854] rounded-[4px] text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin tài khoản (User) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b border-gray-800 pb-2">Thông tin tài khoản</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><IdentificationBadge size={20} /></div>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: Nguyễn Văn A" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><EnvelopeSimple size={20} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!editingId}
                      className={`w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="VD: nguyenvena@email.com" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><Phone size={20} /></div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: 0912345678" />
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><LockKey size={20} /></div>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                        placeholder="Nhập mật khẩu (từ 6 ký tự)" />
                    </div>
                  </div>
                )}
                
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Trạng thái tài khoản</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><Tag size={20} /></div>
                      <select name="status" value={formData.status} onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none">
                        <option value="active">Hoạt động (Active)</option>
                        <option value="inactive">Đã khóa (Inactive)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin Hồ sơ Học sinh (Student) */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium border-b border-gray-800 pb-2">Hồ sơ học sinh</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mã Học sinh</label>
                  <input type="text" name="studentCode" value={formData.studentCode} onChange={handleChange} required
                    className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                    placeholder="VD: HS2024-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ngày sinh</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><CalendarBlank size={20} /></div>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors" style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Giới tính</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><GenderIntersex size={20} /></div>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none">
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ khẩn cấp */}
              <div className="p-4 bg-black border border-gray-800 rounded-[8px]">
                <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2"><Heartbeat size={18} className="text-ps-blue"/> Liên hệ khẩn cấp</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange}
                      className="w-full h-10 px-3 bg-[#121314] border border-gray-800 rounded-[4px] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="Tên người liên hệ..." />
                  </div>
                  <div>
                    <input type="text" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange}
                      className="w-full h-10 px-3 bg-[#121314] border border-gray-800 rounded-[4px] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="Số điện thoại..." />
                  </div>
                  <div>
                    <input type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange}
                      className="w-full h-10 px-3 bg-[#121314] border border-gray-800 rounded-[4px] text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="Quan hệ (VD: Bố/Mẹ)..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-ps-blue text-white rounded-full font-bold text-[16px] hover:bg-[#0064b7] active:bg-[#004d8d] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? 'Đang xử lý...' : (
                  <>
                    {editingId ? <PencilSimple size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
                    {editingId ? 'Cập nhật Học sinh' : 'Tạo Hồ sơ Học sinh'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
