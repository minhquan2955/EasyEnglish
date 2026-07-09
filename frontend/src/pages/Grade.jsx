import { useState, useEffect } from 'react';
import { ClipboardText, Plus, ArrowLeft, Chalkboard, Users, GraduationCap, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Grade() {
  const { user } = useAuth();
  
  // Navigation State
  const [currentLevel, setCurrentLevel] = useState(1); // 1: Classes, 2: Exams, 3: Grading
  
  // Data State
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]); // for grading table
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null); // null if creating new
  
  // Loading & Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State for Exam (Level 3)
  const [isEditMode, setIsEditMode] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    assessmentType: 'quiz',
    maxScore: 10
  });
  
  // Grading State: map of studentId -> { score, feedback }
  const [gradesMap, setGradesMap] = useState({});

  const assessmentTypes = [
    { value: 'quiz', label: 'Quiz / Mini Test' },
    { value: 'homework', label: 'Bài tập về nhà' },
    { value: 'speaking', label: 'Kiểm tra Nói' },
    { value: 'writing', label: 'Kiểm tra Viết' },
    { value: 'midterm', label: 'Giữa kỳ' },
    { value: 'final', label: 'Cuối kỳ' },
  ];

  // LEVEL 1: Fetch Classes
  const fetchClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/classes?limit=200');
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
      setSelectedExam(null);
    }
  }, [currentLevel]);

  // LEVEL 2: Fetch Exams for a Class
  const fetchExams = async (classId) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/grades/class/${classId}/exams`);
      setExams(data.exams || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    fetchExams(cls._id);
    setCurrentLevel(2);
  };

  // LEVEL 3: Enter Grading Table
  const fetchStudentsAndGrades = async (exam) => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Students
      const { data: studentData } = await api.get(`/enrollments/class/${selectedClass._id}/students`);
      const studentList = studentData.students || [];
      setStudents(studentList);

      // 2. Prepare Grades Map
      const initialMap = {};
      
      if (exam) {
        // Edit existing exam -> Fetch existing grades
        setExamForm({
          title: exam.title,
          assessmentType: exam.assessmentType,
          maxScore: exam.maxScore
        });
        
        const { data: gradesData } = await api.get(`/grades/class/${selectedClass._id}?title=${encodeURIComponent(exam.title)}&assessmentType=${exam.assessmentType}`);
        const grades = gradesData.grades || [];
        
        grades.forEach(g => {
          initialMap[g.studentId._id] = {
            score: g.score,
            feedback: g.feedback || ''
          };
        });
      } else {
        // Create new exam -> Reset form
        setExamForm({
          title: '',
          assessmentType: 'quiz',
          maxScore: 10
        });
      }
      
      // Initialize map for students without grades yet
      studentList.forEach(enrollment => {
        const sId = enrollment.studentId._id;
        if (!initialMap[sId]) {
          initialMap[sId] = { score: '', feedback: '' };
        }
      });
      
      setGradesMap(initialMap);
      setCurrentLevel(3);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách học sinh và điểm');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = () => {
    setSelectedExam(null);
    setIsEditMode(true);
    fetchStudentsAndGrades(null);
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setIsEditMode(false);
    fetchStudentsAndGrades(exam);
  };

  const handleGradeChange = (studentId, field, value) => {
    setGradesMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    setError('');
    setSuccess('');
    
    if (!examForm.title.trim()) {
      setError('Vui lòng nhập tên bài kiểm tra');
      return;
    }

    // Prepare scores array
    const scores = [];
    Object.keys(gradesMap).forEach(studentId => {
      const data = gradesMap[studentId];
      if (data.score !== '' && data.score !== null && data.score !== undefined) {
        scores.push({
          studentId,
          score: Number(data.score),
          feedback: data.feedback
        });
      }
    });

    if (scores.length === 0) {
      setError('Phải nhập điểm cho ít nhất 1 học sinh để lưu bài kiểm tra!');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/grades/class/${selectedClass._id}/exam`, {
        assessmentType: examForm.assessmentType,
        title: examForm.title,
        maxScore: Number(examForm.maxScore),
        scores
      });

      setSuccess('Lưu bảng điểm thành công!');
      
      // Update the selectedExam to the saved data so view mode shows correct info
      setSelectedExam({
        title: examForm.title,
        assessmentType: examForm.assessmentType,
        maxScore: examForm.maxScore,
        studentCount: scores.length
      });
      setIsEditMode(false);

      setTimeout(() => {
        setSuccess('');
        fetchExams(selectedClass._id);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi lưu điểm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-black tracking-tight" style={{ fontWeight: 300 }}>
            Quản lý Điểm & Bài kiểm tra
          </h1>
          <p className="text-gray-400 mt-1">
            {currentLevel === 1 && 'Chọn lớp học để quản lý điểm'}
            {currentLevel === 2 && `Danh sách bài kiểm tra - Lớp ${selectedClass?.classCode}`}
            {currentLevel === 3 && (selectedExam ? `Sửa điểm: ${selectedExam.title}` : 'Nhập điểm bài mới')}
          </p>
        </div>
        
        {currentLevel === 2 && (
          <button
            onClick={handleCreateExam}
            className="h-10 px-4 bg-ps-blue text-white rounded-full font-medium text-sm hover:bg-ps-blue-pressed transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} weight="bold" />
            Tạo bài kiểm tra
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
          {currentLevel === 3 ? (
            <>
              <button onClick={() => setCurrentLevel(2)} className="text-gray-400 hover:text-ps-blue transition-colors flex items-center gap-1">
                {selectedClass?.classCode}
              </button>
              <span className="text-gray-600">/</span>
              <span className="text-ps-blue font-medium">Nhập điểm</span>
            </>
          ) : (
            <span className="text-ps-blue font-medium">{selectedClass?.classCode}</span>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {loading && !students.length && !exams.length && !classes.length ? (
        <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
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
                    onClick={() => handleSelectClass(cls)}
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
                        <Chalkboard size={20} weight="fill" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {cls.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* LEVEL 2: EXAM LIST */}
          {currentLevel === 2 && (
            <div className="bg-surface-dark-card rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-dark-elevated text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Tên bài kiểm tra</th>
                    <th className="px-6 py-4 font-medium">Loại bài</th>
                    <th className="px-6 py-4 font-medium">Thang điểm</th>
                    <th className="px-6 py-4 font-medium">Đã chấm</th>
                    <th className="px-6 py-4 font-medium">Giáo viên chấm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {exams.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        Chưa có bài kiểm tra nào. Hãy tạo bài kiểm tra mới.
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => handleEditExam(exam)}
                        className="hover:bg-gray-800/30 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-medium">{exam.title}</td>
                        <td className="px-6 py-4 text-gray-400 capitalize">
                          {assessmentTypes.find(t => t.value === exam.assessmentType)?.label || exam.assessmentType}
                        </td>
                        <td className="px-6 py-4 text-gray-400">Hệ số {exam.maxScore}</td>
                        <td className="px-6 py-4 text-gray-400">
                          <span className="inline-flex items-center px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-medium">
                            {exam.studentCount} bài
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{exam.gradedBy || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* LEVEL 3: GRADING TABLE */}
          {currentLevel === 3 && (
            <div className="space-y-6">
              {/* Exam Info Form */}
              <div className="bg-surface-dark-card rounded-lg border border-gray-800 p-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <ClipboardText size={20} className="text-ps-blue" />
                  Thông tin bài kiểm tra
                </h3>
                {!isEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="block text-sm text-gray-400 mb-1">Tên bài kiểm tra</span>
                      <div className="text-white font-medium text-lg">{examForm.title}</div>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-400 mb-1">Loại bài</span>
                      <div className="text-white font-medium capitalize">
                        {assessmentTypes.find(t => t.value === examForm.assessmentType)?.label || examForm.assessmentType}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-400 mb-1">Điểm tối đa</span>
                      <div className="text-white font-medium">Hệ số {examForm.maxScore}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tên bài kiểm tra <span className="text-red-600">*</span></label>
                      <input
                        type="text"
                        value={examForm.title}
                        onChange={(e) => setExamForm(p => ({ ...p, title: e.target.value }))}
                        disabled={!!selectedExam}
                        placeholder="VD: Midterm Test 1"
                        className="w-full h-10 px-3 bg-black border border-gray-800 rounded-sm text-white focus:outline-none focus:border-ps-blue transition-colors disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Loại bài <span className="text-red-600">*</span></label>
                      <select
                        value={examForm.assessmentType}
                        onChange={(e) => setExamForm(p => ({ ...p, assessmentType: e.target.value }))}
                        disabled={!!selectedExam}
                        className="w-full h-10 px-3 bg-black border border-gray-800 rounded-sm text-white focus:outline-none focus:border-ps-blue transition-colors disabled:opacity-50"
                      >
                        {assessmentTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Điểm tối đa (Max Score) <span className="text-red-600">*</span></label>
                      <input
                        type="number"
                        min="1"
                        value={examForm.maxScore}
                        onChange={(e) => setExamForm(p => ({ ...p, maxScore: e.target.value }))}
                        className="w-full h-10 px-3 bg-black border border-gray-800 rounded-sm text-white focus:outline-none focus:border-ps-blue transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Grading Table */}
              <div className="bg-surface-dark-card rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-4 bg-surface-dark-elevated border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <GraduationCap size={20} className="text-ps-blue" />
                    Bảng nhập điểm ({students.length} học sinh)
                  </h3>
                  <p className="text-xs text-gray-400">Bỏ trống điểm nếu học sinh vắng thi</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-dark-card text-gray-400 border-b border-gray-800">
                      <tr>
                        <th className="px-6 py-3 font-medium w-16">STT</th>
                        <th className="px-6 py-3 font-medium">Học sinh</th>
                        <th className="px-6 py-3 font-medium w-40">Điểm số</th>
                        <th className="px-6 py-3 font-medium">Nhận xét của giáo viên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {students.map((enrollment, idx) => {
                        const student = enrollment.studentId;
                        const sId = student._id;
                        const gradeData = gradesMap[sId] || { score: '', feedback: '' };
                        
                        return (
                          <tr key={sId} className="hover:bg-gray-800/20 transition-colors">
                            <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-white">{student.userId?.fullName}</div>
                              <div className="text-xs text-gray-500">{student.studentCode}</div>
                            </td>
                            <td className="px-6 py-4">
                              {!isEditMode ? (
                                <span className={gradeData.score !== '' ? 'text-white font-medium' : 'text-gray-500 italic'}>
                                  {gradeData.score !== '' ? gradeData.score : 'Chưa nhập'}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  max={examForm.maxScore}
                                  step="0.5"
                                  value={gradeData.score}
                                  onChange={(e) => handleGradeChange(sId, 'score', e.target.value)}
                                  className="w-full h-9 px-3 bg-black border border-gray-700 rounded-sm text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-all"
                                  placeholder="Trống"
                                />
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {!isEditMode ? (
                                <span className="text-gray-300">
                                  {gradeData.feedback || '—'}
                                </span>
                              ) : (
                                <input
                                  type="text"
                                  value={gradeData.feedback}
                                  onChange={(e) => handleGradeChange(sId, 'feedback', e.target.value)}
                                  className="w-full h-9 px-3 bg-black border border-gray-700 rounded-sm text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-all"
                                  placeholder="Nhận xét (không bắt buộc)..."
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-8 h-10 bg-ps-blue text-white rounded-full font-bold text-sm hover:bg-ps-blue-pressed active:bg-ps-blue-active transition-colors flex items-center gap-2"
                  >
                    Chỉnh sửa / Nhập điểm
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedExam) {
                          setCurrentLevel(2); // Cancel new exam
                        } else {
                          setIsEditMode(false); // Cancel edit
                        }
                      }}
                      className="px-6 h-10 text-sm font-medium text-white bg-transparent hover:bg-gray-800 rounded-full transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSaveGrades}
                      disabled={loading}
                      className="px-8 h-10 bg-green-500 text-white rounded-full font-bold text-sm hover:bg-[#008f47] active:bg-[#007339] transition-colors disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? 'Đang lưu...' : 'Lưu bảng điểm'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
