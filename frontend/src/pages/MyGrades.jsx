import { useState, useEffect } from 'react';
import { ClipboardText, WarningCircle, GraduationCap } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

export default function MyGrades() {
  const { user } = useAuth();
  
  const [grades, setGrades] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const assessmentTypes = {
    quiz: 'Quiz / Mini Test',
    homework: 'Bài tập về nhà',
    speaking: 'Kiểm tra Nói',
    writing: 'Kiểm tra Viết',
    midterm: 'Giữa kỳ',
    final: 'Cuối kỳ',
  };

  const fetchMyGrades = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/grades/my-grades', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGrades(data.grades || []);
        
        // Extract class info from the first grade (assuming student is in 1 class)
        if (data.grades && data.grades.length > 0) {
          setClassInfo(data.grades[0].classId);
        }
      } else {
        const errData = await res.json();
        setError(errData.message || 'Lỗi khi tải bảng điểm');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối khi tải bảng điểm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGrades();
  }, []);

  if (user?.role !== 'student') {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Dành riêng cho học viên.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white tracking-tight flex items-center gap-3" style={{ fontWeight: 300 }}>
            <ClipboardText size={32} className="text-ps-blue" />
            Điểm số của tôi
          </h1>
          <p className="text-gray-400 mt-1">
            Theo dõi kết quả học tập và nhận xét từ giáo viên
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] px-4 py-3 rounded-[8px] flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải bảng điểm...</div>
      ) : (
        <div className="bg-[#1a1b1e] rounded-[12px] overflow-hidden shadow-2xl border border-gray-800">
          {/* Class Header */}
          <div className="p-6 bg-[#121314] border-b border-gray-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-ps-blue/10 flex items-center justify-center text-ps-blue shrink-0">
              <GraduationCap size={28} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-medium text-white">
                  {classInfo ? `Lớp ${classInfo.classCode}` : 'Chưa có thông tin lớp'}
                </h2>
                {classInfo?.teacherId?.userId?.fullName && (
                  <span className="text-sm px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                    GV: {classInfo.teacherId.userId.fullName}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {classInfo?.courseId?.name || 'Vui lòng chờ giáo viên cập nhật điểm số đầu tiên'}
              </p>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1b1e] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Tên bài kiểm tra</th>
                  <th className="px-6 py-4 font-medium">Loại bài</th>
                  <th className="px-6 py-4 font-medium text-center">Điểm số</th>
                  <th className="px-6 py-4 font-medium">Ngày chấm</th>
                  <th className="px-6 py-4 font-medium">Nhận xét của GV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Chưa có bài kiểm tra nào được chấm điểm.
                    </td>
                  </tr>
                ) : (
                  grades.map((grade, idx) => {
                    // Tính phần trăm điểm để hiển thị màu
                    const percent = (grade.score / grade.maxScore) * 100;
                    let scoreColor = 'text-[#10b981]'; // Green
                    if (percent < 50) scoreColor = 'text-[#ef4444]'; // Red
                    else if (percent < 80) scoreColor = 'text-[#fbbf24]'; // Yellow

                    return (
                      <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">{grade.title}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {assessmentTypes[grade.assessmentType] || grade.assessmentType}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-lg font-bold ${scoreColor}`}>
                              {grade.score}
                            </span>
                            <span className="text-xs text-gray-500 border-t border-gray-700 w-8 mt-0.5 pt-0.5">
                              {grade.maxScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(grade.gradedAt || grade.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          {grade.feedback ? (
                            <span className="text-gray-300 italic">"{grade.feedback}"</span>
                          ) : (
                            <span className="text-gray-600 italic">Không có nhận xét</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
