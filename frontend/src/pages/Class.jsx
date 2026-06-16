import { useState, useEffect } from 'react';
import { Chalkboard, Plus, Users, Hash, Door, CalendarBlank, Clock, UserSquare, PencilSimple, Tag } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Class() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    classCode: '',
    courseId: '',
    teacherId: '',
    room: '',
    maxStudents: '',
    startDate: '',
    endDate: '',
    scheduleDays: [],
    startTime: '',
    endTime: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClasses = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get('/classes?limit=200');
      setClasses(data.classes || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchDependencies = async () => {
    setLoadingDeps(true);
    try {
      // Fetch courses
      const { data: courseData } = await api.get('/courses');
      setCourses(courseData.courses || courseData || []);

      // Fetch teachers (from teacher profiles)
      const { data: teacherData } = await api.get('/admin/teachers?limit=100');
      const teacherList = teacherData.teachers || [];
      // Map to include fullName from populated userId
      setTeachers(teacherList.map(t => ({
        _id: t._id,
        fullName: t.userId?.fullName || 'Unknown'
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDeps(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchClasses();
    } else {
      fetchDependencies();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayNum) => {
    setFormData(prev => {
      const currentDays = [...prev.scheduleDays];
      if (currentDays.includes(dayNum)) {
        return { ...prev, scheduleDays: currentDays.filter(d => d !== dayNum) };
      } else {
        return { ...prev, scheduleDays: [...currentDays, dayNum] };
      }
    });
  };

  const handleEdit = (cls) => {
    setEditingId(cls._id);
    setFormData({
      classCode: cls.classCode || '',
      courseId: cls.courseId?._id || cls.courseId || '',
      teacherId: cls.teacherId?._id || cls.teacherId || '',
      room: cls.room || '',
      maxStudents: cls.maxStudents || '',
      startDate: cls.startDate ? new Date(cls.startDate).toISOString().split('T')[0] : '',
      endDate: cls.endDate ? new Date(cls.endDate).toISOString().split('T')[0] : '',
      scheduleDays: cls.schedule?.daysOfWeek || [],
      startTime: cls.schedule?.startTime || '',
      endTime: cls.schedule?.endTime || '',
      status: cls.status || 'active'
    });
    setError('');
    setSuccess('');
    setActiveTab('create');
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      classCode: '',
      courseId: '',
      teacherId: '',
      room: '',
      maxStudents: '',
      startDate: '',
      endDate: '',
      scheduleDays: [],
      startTime: '',
      endTime: '',
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
    
    if (formData.scheduleDays.length === 0) {
      setError('Vui lòng chọn ít nhất một ngày học trong tuần');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        classCode: formData.classCode,
        courseId: formData.courseId,
        teacherId: formData.teacherId,
        room: formData.room,
        maxStudents: Number(formData.maxStudents),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        schedule: {
          daysOfWeek: formData.scheduleDays,
          startTime: formData.startTime,
          endTime: formData.endTime
        }
      };

      const endpoint = editingId ? `/classes/${editingId}` : '/classes';
      const { data } = editingId
        ? await api.put(endpoint, payload)
        : await api.post(endpoint, payload);

      setSuccess(editingId ? `Cập nhật lớp học ${data.classCode || formData.classCode} thành công!` : `Tạo lớp học ${data.classCode || formData.classCode} thành công!`);
      
      if (!editingId) {
        setFormData({
          classCode: '',
          courseId: '',
          teacherId: '',
          room: '',
          maxStudents: '',
          startDate: '',
          endDate: '',
          scheduleDays: [],
          startTime: '',
          endTime: '',
          status: 'active'
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const dayMap = {
    0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7'
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl mb-2 text-white" style={{ fontWeight: 300, letterSpacing: '0.1px' }}>
            Quản lý Lớp học
          </h1>
          <p className="text-gray-400">Xem danh sách lớp học và sắp xếp lịch dạy.</p>
        </div>

        {/* Tabs */}
        {user?.role === 'admin' && (
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
        )}
      </div>

      {activeTab === 'list' && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Chalkboard size={24} className="text-ps-blue" />
            <h2 className="text-xl" style={{ fontWeight: 300 }}>Danh sách Lớp học</h2>
          </div>

          {loadingList ? (
            <div className="text-center py-10 text-gray-500">Đang tải danh sách...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="pb-3 font-medium">Mã Lớp</th>
                    <th className="pb-3 font-medium">Khóa học</th>
                    <th className="pb-3 font-medium">Giáo viên</th>
                    <th className="pb-3 font-medium">Phòng</th>
                    <th className="pb-3 font-medium">Sĩ số (Max)</th>
                    <th className="pb-3 font-medium">Khai giảng</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    {user?.role === 'admin' && (
                      <th className="pb-3 font-medium text-right">Hành động</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {classes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-500">
                        Không có lớp học nào.
                      </td>
                    </tr>
                  ) : (
                    classes.map((cls) => (
                      <tr key={cls._id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                        <td className="py-4 text-white font-medium">{cls.classCode}</td>
                        <td className="py-4 text-gray-300">{cls.courseId?.name || '-'}</td>
                        <td className="py-4 text-gray-300">{cls.teacherId?.userId?.fullName || '-'}</td>
                        <td className="py-4 text-gray-400">{cls.room || '-'}</td>
                        <td className="py-4 text-gray-400">
                          {cls.studentCount !== undefined ? `${cls.studentCount} / ${cls.maxStudents}` : cls.maxStudents}
                        </td>
                        <td className="py-4 text-gray-400">
                          {cls.startDate ? new Date(cls.startDate).toLocaleDateString('vi-VN') : '-'}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-[4px] text-xs font-medium ${
                            cls.status === 'active' ? 'bg-[#00a854]/10 text-[#00a854]' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {cls.status}
                          </span>
                        </td>
                        {user?.role === 'admin' && (
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleEdit(cls)}
                              className="p-2 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors inline-flex"
                              title="Sửa thông tin"
                            >
                              <PencilSimple size={16} />
                            </button>
                          </td>
                        )}
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
              {editingId ? (
                <PencilSimple size={24} weight="fill" className="text-ps-blue" />
              ) : (
                <Plus size={24} weight="bold" className="text-ps-blue" />
              )}
            </div>
            <h2 className="text-2xl text-white" style={{ fontWeight: 300 }}>
              {editingId ? 'Chỉnh Sửa Lớp Học' : 'Tạo Lớp Học Mới'}
            </h2>
          </div>

          {loadingDeps ? (
            <div className="text-center py-10 text-gray-500">Đang tải dữ liệu khóa học và giáo viên...</div>
          ) : (
            <>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mã Lớp Học</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Hash size={20} />
                      </div>
                      <input
                        type="text"
                        name="classCode"
                        value={formData.classCode}
                        onChange={handleChange}
                        required
                        disabled={!!editingId}
                        placeholder="VD: ENG-2024-01"
                        className={`w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Khóa học</label>
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                    >
                      <option value="">-- Chọn khóa học --</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Giáo viên phụ trách</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <UserSquare size={20} />
                      </div>
                      <select
                        name="teacherId"
                        value={formData.teacherId}
                        onChange={handleChange}
                        required
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                      >
                        <option value="">-- Chọn giáo viên --</option>
                        {teachers.map(t => (
                          <option key={t._id} value={t._id}>{t.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phòng học</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Door size={20} />
                      </div>
                      <input
                        type="text"
                        name="room"
                        value={formData.room}
                        onChange={handleChange}
                        placeholder="VD: Room A1"
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Sĩ số tối đa</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Users size={20} />
                      </div>
                      <input
                        type="number"
                        name="maxStudents"
                        value={formData.maxStudents}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="VD: 15"
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ngày bắt đầu</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <CalendarBlank size={20} />
                      </div>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ngày kết thúc</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <CalendarBlank size={20} />
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full h-12 pl-10 pr-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
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
                        <option value="active">Đang mở (Active)</option>
                        <option value="inactive">Tạm dừng (Inactive)</option>
                        <option value="completed">Đã kết thúc (Completed)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="border border-gray-800 rounded-[8px] p-5 mt-6">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-ps-blue"/> Lịch học trong tuần
                  </h3>
                  
                  <div className="mb-5">
                    <label className="block text-sm text-gray-400 mb-2">Chọn ngày học:</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 0].map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors border ${
                            formData.scheduleDays.includes(day)
                              ? 'bg-ps-blue border-ps-blue text-white'
                              : 'bg-black border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {dayMap[day]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Giờ bắt đầu</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Giờ kết thúc</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className="w-full h-12 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-ps-blue text-white rounded-full font-bold text-[16px] hover:bg-[#0064b7] active:bg-[#004d8d] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Đang xử lý...' : (
                      <>
                        {editingId ? <PencilSimple size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
                        {editingId ? 'Cập nhật' : 'Tạo Lớp học'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
