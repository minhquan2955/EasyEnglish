import { useState, useEffect } from 'react';
import { Books, Plus, BookBookmark, Hash, Money, Clock, Tag, PencilSimple, MagnifyingGlass } from '@phosphor-icons/react';
import api from '../api';

export default function Course() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'ielts',
    totalSessions: '',
    sessionDurationMins: '',
    tuitionFee: '',
    curriculum: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data } = await api.get('/courses');
      setCourses(data.courses || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchCourses();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      code: course.code || '',
      name: course.name || '',
      category: course.category || 'ielts',
      totalSessions: course.totalSessions || '',
      sessionDurationMins: course.sessionDurationMins || '',
      tuitionFee: course.tuitionFee || '',
      curriculum: course.curriculum && course.curriculum.length > 0 ? course.curriculum[0].materials : '',
      status: course.status || 'active'
    });
    setError('');
    setSuccess('');
    setActiveTab('create');
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      category: 'ielts',
      totalSessions: '',
      sessionDurationMins: '',
      tuitionFee: '',
      curriculum: '',
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
        ...formData,
        totalSessions: Number(formData.totalSessions),
        sessionDurationMins: Number(formData.sessionDurationMins),
        tuitionFee: Number(formData.tuitionFee),
        curriculum: formData.curriculum ? [{
          sessionNo: 1,
          topic: "Giáo trình",
          materials: formData.curriculum
        }] : []
      };

      const endpoint = editingId ? `/courses/${editingId}` : '/courses';
      const { data } = editingId
        ? await api.put(endpoint, payload)
        : await api.post(endpoint, payload);

      setSuccess(editingId ? `Cập nhật khóa học ${data.name || formData.name} thành công!` : `Tạo khóa học ${data.name || formData.name} thành công!`);
      
      if (!editingId) {
        setFormData({
          code: '',
          name: '',
          category: 'ielts',
          totalSessions: '',
          sessionDurationMins: '',
          tuitionFee: '',
          curriculum: '',
          status: 'active'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryMap = {
    ielts: 'IELTS',
    nursery: 'Mẫu giáo',
    kids: 'Thiếu nhi',
    teens: 'Thiếu niên'
  };

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.code || '').toLowerCase().includes(q) ||
      (c.name || '').toLowerCase().includes(q) ||
      (categoryMap[c.category] || c.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl mb-2 text-black" style={{ fontWeight: 300, letterSpacing: '0.1px' }}>
            Quản lý Khóa học
          </h1>
          <p className="text-gray-400">Xem danh sách và thêm mới các khóa học của trung tâm.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-black p-1 rounded-full border border-gray-800">
          <button
            onClick={() => {
              setActiveTab('list');
              setEditingId(null);
            }}
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Books size={24} className="text-ps-blue" />
              <h2 className="text-xl" style={{ fontWeight: 300 }}>Danh sách Khóa học</h2>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <MagnifyingGlass size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã, tên khóa học..."
                className="h-9 pl-9 pr-3 bg-black border border-gray-800 text-white rounded-[4px] text-sm focus:outline-none focus:border-ps-blue transition-colors w-[260px] placeholder:text-gray-600"
              />
            </div>
          </div>

          {loadingCourses ? (
            <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Mã KH</th>
                    <th className="pb-3 font-medium">Tên Khóa học</th>
                    <th className="pb-3 font-medium">Phân loại</th>
                    <th className="pb-3 font-medium">Số buổi</th>
                    <th className="pb-3 font-medium">Học phí (VND)</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        Không có khóa học nào.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course) => (
                      <tr key={course._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                        <td className="py-4 text-gray-400">{course.code}</td>
                        <td className="py-4 text-white font-medium">{course.name}</td>
                        <td className="py-4 text-gray-300">{categoryMap[course.category] || course.category}</td>
                        <td className="py-4 text-gray-400">{course.totalSessions}</td>
                        <td className="py-4 text-gray-400">
                          {course.tuitionFee?.toLocaleString()} đ
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-[4px] text-xs font-medium ${
                            course.status === 'active' ? 'bg-[#00a854]/10 text-[#00a854]' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {course.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleEdit(course)}
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
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-ps-blue/20 flex items-center justify-center">
              {editingId ? (
                <PencilSimple size={24} weight="fill" className="text-ps-blue" />
              ) : (
                <Plus size={24} weight="bold" className="text-ps-blue" />
              )}
            </div>
            <h2 className="text-2xl text-white" style={{ fontWeight: 300 }}>
              {editingId ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] rounded-[4px] text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-[#00a854]/10 border border-[#00a854]/20 text-[#00a854] rounded-[4px] text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mã Khóa Học</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Hash size={20} />
                  </div>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    disabled={!!editingId}
                    placeholder="VD: IELTS-ADV"
                    className={`w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phân loại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Tag size={20} />
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                  >
                    <option value="ielts">IELTS</option>
                    <option value="nursery">Mẫu giáo</option>
                    <option value="kids">Thiếu nhi</option>
                    <option value="teens">Thiếu niên</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tên Khóa Học</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <BookBookmark size={20} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên khóa học..."
                  className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Số buổi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Hash size={20} />
                  </div>
                  <input
                    type="number"
                    name="totalSessions"
                    value={formData.totalSessions}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="VD: 24"
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Thời lượng (phút)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Clock size={20} />
                  </div>
                  <input
                    type="number"
                    name="sessionDurationMins"
                    value={formData.sessionDurationMins}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="VD: 90"
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Học phí (VND)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Money size={20} />
                  </div>
                  <input
                    type="number"
                    name="tuitionFee"
                    value={formData.tuitionFee}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="VD: 5000000"
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Giáo trình (Curriculum)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Books size={20} />
                </div>
                <input
                  type="text"
                  name="curriculum"
                  value={formData.curriculum}
                  onChange={handleChange}
                  placeholder="Tên sách hoặc tài liệu sử dụng..."
                  className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                />
              </div>
            </div>

            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Trạng thái</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Tag size={20} />
                  </div>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                  >
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Đã khóa (Inactive)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-ps-blue text-white rounded-full font-bold text-[16px] hover:bg-[#0064b7] active:bg-[#004d8d] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? 'Đang xử lý...' : (
                  <>
                    {editingId ? <PencilSimple size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
                    {editingId ? 'Cập nhật' : 'Tạo Khóa học'}
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
