import { useState, useEffect } from 'react';
import { CheckSquareOffset, WarningCircle, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function MyAttendance() {
  const { user } = useAuth();
  
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/attendances/my-attendance');
      const sorted = (data.attendances || []).sort((a, b) => {
        return new Date(b.scheduleId?.date) - new Date(a.scheduleId?.date);
      });
      setAttendances(sorted);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải điểm danh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  if (user?.role !== 'student') {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Dành riêng cho học viên.
      </div>
    );
  }

  // Calculate stats
  const presentCount = attendances.filter(a => a.status === 'present').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white tracking-tight flex items-center gap-3" style={{ fontWeight: 300 }}>
            <CheckSquareOffset size={32} className="text-ps-blue" />
            Lịch sử điểm danh
          </h1>
          <p className="text-gray-400 mt-1">
            Theo dõi tình trạng chuyên cần của bạn
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-600/10 border border-red-600/20 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải lịch sử điểm danh...</div>
      ) : (
        <div className="bg-surface-dark-card rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          {/* Stats Header */}
          <div className="p-6 bg-surface-dark-elevated border-b border-gray-800 flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white">
                <span className="text-xl font-medium">{attendances.length}</span>
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

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-dark-card text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Buổi học</th>
                  <th className="px-6 py-4 font-medium">Lớp</th>
                  <th className="px-6 py-4 font-medium">Thời gian</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      Chưa có bản ghi điểm danh nào.
                    </td>
                  </tr>
                ) : (
                  attendances.map((record) => {
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
      )}
    </div>
  );
}
