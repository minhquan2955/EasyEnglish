import { useState, useEffect } from 'react';
import { CheckSquareOffset, WarningCircle, CheckCircle, XCircle, UserCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ChildrenAttendance() {
  const { user } = useAuth();
  
  const [childrenData, setChildrenData] = useState([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChildrenAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/attendances/my-children');
      const children = data.children || [];
      
      children.forEach(child => {
        if (child.attendances) {
          child.attendances.sort((a, b) => new Date(b.scheduleId?.date) - new Date(a.scheduleId?.date));
        }
      });
      
      setChildrenData(children);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải điểm danh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildrenAttendance();
  }, []);

  if (user?.role !== 'parent') {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Dành riêng cho Phụ huynh.
      </div>
    );
  }

  const activeChild = childrenData[activeChildIndex];
  const activeAttendances = activeChild?.attendances || [];

  const presentCount = activeAttendances.filter(a => a.status === 'present').length;
  const absentCount = activeAttendances.filter(a => a.status === 'absent').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white tracking-tight flex items-center gap-3" style={{ fontWeight: 300 }}>
            <CheckSquareOffset size={32} className="text-ps-blue" />
            Điểm danh của con
          </h1>
          <p className="text-gray-400 mt-1">
            Theo dõi tình trạng chuyên cần của các bé
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
        <div className="text-center py-20 text-gray-400">Đang tải dữ liệu điểm danh...</div>
      ) : childrenData.length === 0 ? (
        <div className="bg-[#1a1b1e] rounded-[12px] p-12 text-center border border-gray-800">
          <UserCircle size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">Chưa có hồ sơ học sinh</h3>
          <p className="text-gray-400">Tài khoản của bạn chưa được liên kết với học sinh nào. Vui lòng liên hệ trung tâm để được hỗ trợ.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs for Children */}
          <div className="flex border-b border-gray-800">
            {childrenData.map((childData, idx) => (
              <button
                key={childData.student._id}
                onClick={() => setActiveChildIndex(idx)}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeChildIndex === idx 
                    ? 'text-ps-blue' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCircle size={20} />
                  {childData.student.fullName}
                </div>
                {activeChildIndex === idx && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-ps-blue" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-[#1a1b1e] rounded-[12px] overflow-hidden shadow-2xl border border-gray-800">
            {/* Stats Header */}
            <div className="p-6 bg-[#121314] border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white">
                    <span className="text-xl font-medium">{activeAttendances.length}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tổng số buổi</p>
                    <p className="font-medium text-white">Đã điểm danh</p>
                  </div>
                </div>
                
                <div className="w-px h-12 bg-gray-800"></div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                    <CheckCircle size={28} weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Có mặt</p>
                    <p className="font-medium text-white text-lg">{presentCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
                    <XCircle size={28} weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Vắng mặt</p>
                    <p className="font-medium text-white text-lg">{absentCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1b1e] border border-gray-800 px-4 py-2 rounded-[8px]">
                <span className="text-sm text-gray-400">Học sinh:</span>
                <span className="ml-2 font-medium text-white">{activeChild.student.fullName}</span>
                <span className="ml-2 text-xs text-gray-500">({activeChild.student.studentCode})</span>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1a1b1e] text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Buổi học</th>
                    <th className="px-6 py-4 font-medium">Lớp</th>
                    <th className="px-6 py-4 font-medium">Thời gian</th>
                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                    <th className="px-6 py-4 font-medium">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {activeAttendances.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        Bé chưa có bản ghi điểm danh nào.
                      </td>
                    </tr>
                  ) : (
                    activeAttendances.map((record) => {
                      const schedule = record.scheduleId || {};
                      return (
                        <tr key={record._id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-white">Buổi {schedule.sessionNumber}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            {record.classId?.classCode}
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            <div className="flex flex-col">
                              <span>{new Date(schedule.date).toLocaleDateString('vi-VN')}</span>
                              <span className="text-xs">{schedule.startTime} - {schedule.endTime}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {record.status === 'present' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10b981]/10 text-[#10b981]">
                                <CheckCircle size={14} weight="fill" /> Có mặt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#ef4444]/10 text-[#ef4444]">
                                <XCircle size={14} weight="fill" /> Vắng mặt
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {record.notes ? (
                              <span className="text-gray-300 italic">{record.notes}</span>
                            ) : (
                              <span className="text-gray-600">-</span>
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
        </div>
      )}
    </div>
  );
}
