import { useState, useEffect } from 'react';
import { UsersThree, Plus, IdentificationBadge, EnvelopeSimple, Phone, LockKey, PencilSimple, Tag, Users, MagnifyingGlass } from '@phosphor-icons/react';
import api from '../api';

export default function Parent() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [parents, setParents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    relationship: 'father',
    studentIds: [],
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchParents = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get('/admin/parents');
      setParents(data.parents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/students?limit=100');
      setAllStudents(data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchParents();
    } else {
      fetchStudents();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (parent) => {
    setEditingId(parent._id);
    setFormData({
      fullName: parent.userId?.fullName || '',
      email: parent.userId?.email || '',
      phone: parent.userId?.phone || '',
      password: '',
      relationship: parent.relationship || 'father',
      studentIds: parent.studentIds?.map(s => s._id) || [],
      status: parent.userId?.status || 'active'
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
      relationship: 'father',
      studentIds: [],
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
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship,
        studentIds: formData.studentIds
      };

      if (!editingId && formData.password) {
        payload.password = formData.password;
      }
      if (editingId) {
        payload.status = formData.status;
      }

      const endpoint = editingId ? `/admin/parents/${editingId}` : '/admin/parents';
      editingId
        ? await api.put(endpoint, payload)
        : await api.post(endpoint, payload);

      setSuccess(editingId ? `Cập nhật phụ huynh thành công!` : `Tạo phụ huynh thành công!`);
      
      if (!editingId) {
        handleCreateNew(); // Reset form
        setSuccess(`Tạo phụ huynh thành công!`); // Restore success message after reset
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter((pr) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (pr.userId?.fullName || '').toLowerCase().includes(q) ||
      (pr.userId?.email || '').toLowerCase().includes(q) ||
      (pr.userId?.phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl mb-2 text-black" style={{ fontWeight: 300, letterSpacing: '0.1px' }}>
            Quản lý Phụ huynh
          </h1>
          <p className="text-gray-400">Xem danh sách phụ huynh và liên kết với học sinh.</p>
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
        <div className="bg-surface-dark-elevated rounded-lg border border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <UsersThree size={24} className="text-ps-blue" />
              <h2 className="text-xl" style={{ fontWeight: 300 }}>Danh sách Phụ huynh</h2>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <MagnifyingGlass size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, email, SĐT..."
                className="h-9 pl-9 pr-3 bg-black border border-gray-800 text-white rounded-sm text-sm focus:outline-none focus:border-ps-blue transition-colors w-65 placeholder:text-gray-600"
              />
            </div>
          </div>

          {loadingList ? (
            <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Họ và tên</th>
                    <th className="pb-3 font-medium">Email / SĐT</th>
                    <th className="pb-3 font-medium">Vai trò</th>
                    <th className="pb-3 font-medium">Các con (Học sinh)</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        Chưa có phụ huynh nào.
                      </td>
                    </tr>
                  ) : (
                    filteredParents.map((pr) => (
                      <tr key={pr._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                        <td className="py-4 text-white font-medium">{pr.userId?.fullName || '-'}</td>
                        <td className="py-4 text-gray-400">
                          <div>{pr.userId?.email || '-'}</div>
                          <div className="text-xs text-gray-500">{pr.userId?.phone || '-'}</div>
                        </td>
                        <td className="py-4 text-gray-400">
                          {pr.relationship === 'father' ? 'Bố' : pr.relationship === 'mother' ? 'Mẹ' : 'Người giám hộ'}
                        </td>
                        <td className="py-4 text-gray-400">
                          {pr.studentIds?.map(s => s.userId?.fullName || 'Học sinh ẩn').join(', ') || 'Chưa liên kết'}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                            pr.userId?.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-600/10 text-red-600'
                          }`}>
                            {pr.userId?.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleEdit(pr)}
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
        <div className="bg-surface-dark-elevated rounded-lg border border-gray-800 p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-ps-blue/20 flex items-center justify-center">
              {editingId ? <PencilSimple size={24} weight="fill" className="text-ps-blue" /> : <Plus size={24} weight="bold" className="text-ps-blue" />}
            </div>
            <h2 className="text-2xl text-white" style={{ fontWeight: 300 }}>
              {editingId ? 'Chỉnh Sửa Phụ Huynh' : 'Tạo Hồ Sơ Phụ Huynh'}
            </h2>
          </div>

          {error && <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 text-red-600 rounded-sm text-sm">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-sm text-sm">{success}</div>}

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
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: Lê Văn C" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><EnvelopeSimple size={20} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!editingId}
                      className={`w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="VD: levanc@email.com" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><Phone size={20} /></div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                      className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      placeholder="VD: 0912345678" />
                  </div>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><LockKey size={20} /></div>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
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
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-sm text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none">
                        <option value="active">Hoạt động (Active)</option>
                        <option value="inactive">Đã khóa (Inactive)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin Hồ sơ Phụ huynh (Parent) */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium border-b border-gray-800 pb-2">Liên kết học sinh</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mối quan hệ</label>
                  <select name="relationship" value={formData.relationship} onChange={handleChange}
                    className="w-full h-12 px-4 bg-black border border-gray-800 rounded-sm text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none">
                    <option value="father">Bố</option>
                    <option value="mother">Mẹ</option>
                    <option value="guardian">Người giám hộ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Học sinh liên kết (Chọn nhiều)</label>
                  <select multiple name="studentIds" value={formData.studentIds} onChange={handleChange}
                    className="w-full h-32 px-4 py-2 bg-black border border-gray-800 rounded-sm text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                    style={{ colorScheme: 'dark' }}>
                    {allStudents.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.studentCode} - {student.userId?.fullName || 'Không rõ tên'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Nhấn giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều học sinh.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-ps-blue text-white rounded-full font-bold text-[16px] hover:bg-ps-blue-pressed active:bg-ps-blue-active transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? 'Đang xử lý...' : (
                  <>
                    {editingId ? <PencilSimple size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
                    {editingId ? 'Cập nhật Phụ huynh' : 'Tạo Hồ sơ Phụ huynh'}
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
