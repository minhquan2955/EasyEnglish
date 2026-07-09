import { useState, useEffect, useMemo } from 'react';
import { Chalkboard, Users, UserPlus, ArrowLeft, WarningCircle, CheckCircle, Trash } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Enrollment() {
  const { user } = useAuth();
  
  // Navigation State
  const [currentLevel, setCurrentLevel] = useState(1); // 1: Classes, 2: Students in Class
  
  // Data State
  const [classes, setClasses] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]); // Students in the selected class
  const [allStudents, setAllStudents] = useState([]); // All students in the center
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Loading & Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState(null); // { id, studentName }

  // Form State for Adding Student
  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    enrollDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // LEVEL 1: Fetch Classes
  const fetchClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/classes');
      setClasses(data.classes || data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLevel === 1) {
      fetchClasses();
      setSelectedClass(null);
    }
  }, [currentLevel]);

  // LEVEL 2: Fetch Students for a Class & All Students
  const fetchClassDetails = async (cls) => {
    setLoading(true);
    setError('');
    setSelectedClass(cls);
    
    try {
      // Fetch enrolled students
      const { data: enrolledData } = await api.get(`/enrollments/class/${cls._id}/students`);
      setEnrolledStudents(enrolledData.students || []);

      // Fetch all students (for the dropdown)
      if (allStudents.length === 0) {
        const { data: allData } = await api.get('/admin/students?limit=2000');
        setAllStudents(allData.students || []);
      }
      
      setCurrentLevel(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  };

  // Lọc ra các học sinh chưa có trong lớp
  const availableStudents = useMemo(() => {
    const enrolledIds = enrolledStudents.map(e => e.studentId?._id);
    return allStudents.filter(s => !enrolledIds.includes(s._id));
  }, [allStudents, enrolledStudents]);

  const handleOpenModal = () => {
    setEnrollForm({
      studentId: '',
      enrollDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setModalOpen(true);
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!enrollForm.studentId) {
      setError('Vui lòng chọn một học sinh');
      return;
    }
    
    // Kiểm tra sĩ số
    if (enrolledStudents.length >= selectedClass.maxStudents) {
      setError('Lớp học đã đạt sĩ số tối đa!');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      await api.post('/enrollments', {
        studentId: enrollForm.studentId,
        classId: selectedClass._id,
        enrollDate: enrollForm.enrollDate,
        notes: enrollForm.notes
      });

      setSuccess('Ghi danh học sinh thành công!');
      setModalOpen(false);
      fetchClassDetails(selectedClass);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi ghi danh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (enrollmentId, studentName) => {
    setEnrollmentToDelete({ id: enrollmentId, studentName });
    setDeleteModalOpen(true);
  };

  const confirmDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;
    
    setDeleteModalOpen(false);
    const enrollmentId = enrollmentToDelete.id;
    setEnrollmentToDelete(null);

    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setSuccess('Đã xóa học sinh khỏi lớp');
      fetchClassDetails(selectedClass);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi xóa học sinh');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý ghi danh.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-black tracking-tight" style={{ fontWeight: 300 }}>
            Quản lý Ghi danh
          </h1>
          <p className="text-gray-400 mt-1">
            {currentLevel === 1 && 'Chọn lớp học để quản lý danh sách học sinh'}
            {currentLevel === 2 && `Danh sách học sinh - Lớp ${selectedClass?.classCode}`}
          </p>
        </div>
        
        {currentLevel === 2 && (
          <button
            onClick={handleOpenModal}
            className="h-10 px-4 bg-ps-blue text-white rounded-full font-medium text-sm hover:bg-ps-blue-pressed transition-colors flex items-center gap-2 shadow-lg"
          >
            <UserPlus size={18} weight="bold" />
            Thêm học sinh
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-600/10 border border-red-600/20 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      {currentLevel > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => setCurrentLevel(1)} className="text-gray-400 hover:text-ps-blue transition-colors flex items-center gap-1">
            <Chalkboard size={16} /> Lớp học
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-ps-blue font-medium">{selectedClass?.classCode}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading && currentLevel === 1 ? (
        <div className="text-center py-20 text-gray-400">Đang tải danh sách lớp...</div>
      ) : (
        <>
          {/* LEVEL 1: CLASS LIST */}
          {currentLevel === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-surface-dark-card rounded-lg border border-gray-800 text-gray-400">
                  Không có lớp học nào đang hoạt động.
                </div>
              ) : (
                classes.map(cls => (
                  <div
                    key={cls._id}
                    onClick={() => fetchClassDetails(cls)}
                    className="bg-surface-dark-card border border-gray-800 rounded-lg p-5 cursor-pointer hover:border-ps-blue hover:shadow-[0_0_15px_rgba(0,112,209,0.15)] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-white group-hover:text-ps-blue transition-colors">
                          {cls.classCode}
                        </h3>
                        <p className="text-sm text-gray-400">{cls.courseId?.name || 'Khóa học trống'}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-ps-blue/10 text-ps-blue flex items-center justify-center">
                        <Users size={20} weight="fill" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                      <div className="flex items-center gap-1">
                        Sĩ số: {cls.studentCount !== undefined ? `${cls.studentCount} / ${cls.maxStudents}` : `Tối đa ${cls.maxStudents}`}
                      </div>
                      <div className="flex items-center gap-1 text-ps-blue">
                        {cls.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* LEVEL 2: ENROLLED STUDENTS LIST */}
          {currentLevel === 2 && (
            <div className="bg-surface-dark-card rounded-lg border border-gray-800 overflow-hidden">
              <div className="p-4 bg-surface-dark-elevated border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-white font-medium">Danh sách học sinh</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  enrolledStudents.length >= selectedClass.maxStudents 
                    ? 'bg-red-600/20 text-red-600' 
                    : 'bg-green-500/20 text-green-500'
                }`}>
                  Sĩ số: {enrolledStudents.length} / {selectedClass.maxStudents}
                </span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-dark-elevated text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-medium w-16">STT</th>
                    <th className="px-6 py-4 font-medium">Mã HS</th>
                    <th className="px-6 py-4 font-medium">Họ và tên</th>
                    <th className="px-6 py-4 font-medium">Ngày ghi danh</th>
                    <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {enrolledStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        Lớp chưa có học sinh nào.
                      </td>
                    </tr>
                  ) : (
                    enrolledStudents.map((enrollment, idx) => {
                      const student = enrollment.studentId;
                      return (
                        <tr key={enrollment._id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                          <td className="px-6 py-4 text-ps-blue font-medium">{student?.studentCode}</td>
                          <td className="px-6 py-4 text-white">{student?.userId?.fullName}</td>
                          <td className="px-6 py-4 text-gray-400">
                            {new Date(enrollment.enrollDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteClick(enrollment._id, student?.userId?.fullName)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-600/10 rounded-md transition-all"
                              title="Xóa khỏi lớp"
                            >
                              <Trash size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ADD STUDENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-dark-card rounded-xl border border-gray-800 w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl text-white font-medium">Thêm học sinh vào lớp {selectedClass?.classCode}</h2>
            </div>
            
            <form onSubmit={handleEnrollStudent} className="p-6 space-y-5">
              {enrolledStudents.length >= selectedClass?.maxStudents && (
                <div className="bg-red-600/10 border border-red-600/20 text-red-600 px-4 py-3 rounded-lg text-sm">
                  Lớp đã đạt sĩ số tối đa ({selectedClass.maxStudents}). Bạn không thể thêm học sinh mới.
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Chọn học sinh <span className="text-red-600">*</span></label>
                <select
                  value={enrollForm.studentId}
                  onChange={(e) => setEnrollForm(p => ({ ...p, studentId: e.target.value }))}
                  required
                  className="w-full h-11 px-3 bg-black border border-gray-800 rounded-md text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {availableStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.studentCode} - {s.userId?.fullName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Danh sách chỉ hiển thị các học sinh chưa có trong lớp.
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ngày ghi danh</label>
                <input
                  type="date"
                  value={enrollForm.enrollDate}
                  onChange={(e) => setEnrollForm(p => ({ ...p, enrollDate: e.target.value }))}
                  className="w-full h-11 px-3 bg-black border border-gray-800 rounded-md text-white focus:outline-none focus:border-ps-blue transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ghi chú thêm</label>
                <textarea
                  value={enrollForm.notes}
                  onChange={(e) => setEnrollForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full p-3 bg-black border border-gray-800 rounded-md text-white focus:outline-none focus:border-ps-blue transition-colors resize-none"
                  placeholder="Ghi chú (không bắt buộc)..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 h-10 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || enrolledStudents.length >= selectedClass?.maxStudents}
                  className="px-6 h-10 bg-ps-blue text-white rounded-full font-medium text-sm hover:bg-ps-blue-pressed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang lưu...' : 'Thêm vào lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-surface-dark-card rounded-xl border border-gray-800 w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                <WarningCircle size={22} weight="bold" />
              </div>
              <h2 className="text-xl text-white font-medium">Xác nhận xóa</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                Bạn có chắc chắn muốn xóa học sinh <strong className="text-white">{enrollmentToDelete?.studentName}</strong> khỏi lớp không?
              </p>
              <p className="text-sm text-gray-500">
                Hành động này không thể hoàn tác. Điểm danh và các thông tin liên quan của học sinh trong lớp này cũng có thể bị ảnh hưởng.
              </p>
            </div>

            <div className="p-6 bg-surface-dark-elevated border-t border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 h-10 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteEnrollment}
                className="px-6 h-10 bg-red-600 text-white rounded-full font-medium text-sm hover:bg-[#a6132c] transition-colors"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
