import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import vi from 'date-fns/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, WarningCircle, UserCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: vi }),
  getDay,
  locales,
});

export default function ChildrenSchedule() {
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchChildrenSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/schedules/my-children');
      setChildrenData(data.children || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildrenSchedule();
  }, []);

  // Get events for the currently active child
  const activeEvents = useMemo(() => {
    if (childrenData.length === 0 || !childrenData[activeChildIndex]) return [];
    
    const schedules = childrenData[activeChildIndex].schedules || [];
    
    return schedules.map(session => {
      const startDate = new Date(`${session.date.split('T')[0]}T${session.startTime}`);
      const endDate = new Date(`${session.date.split('T')[0]}T${session.endTime}`);
      return {
        id: session._id,
        title: `Lớp ${session.classId?.classCode} - P.${session.classId?.room}`,
        start: startDate,
        end: endDate,
        resource: session,
        type: session.status // 'scheduled' | 'makeup' | 'cancelled' | 'completed'
      };
    });
  }, [childrenData, activeChildIndex]);

  // Auto-jump to nearest event when changing child
  useEffect(() => {
    if (activeEvents.length > 0) {
      const now = new Date();
      const futureEvents = activeEvents.filter(e => e.start >= now);
      if (futureEvents.length > 0) {
        const earliest = futureEvents.reduce((a, b) => a.start < b.start ? a : b);
        setCurrentDate(earliest.start);
      } else {
        const latest = activeEvents.reduce((a, b) => a.start > b.start ? a : b);
        setCurrentDate(latest.start);
      }
    }
  }, [activeEvents]);

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const eventPropGetter = (event) => {
    let backgroundColor = '#0070d1'; // Default PS Blue
    let color = '#ffffff';

    if (event.type === 'makeup') {
      backgroundColor = '#fbbf24'; // Yellow
      color = '#000000';
    } else if (event.type === 'cancelled') {
      backgroundColor = '#ef4444'; // Red
    } else if (event.type === 'completed') {
      backgroundColor = '#10b981'; // Green
    }

    return {
      style: {
        backgroundColor,
        color,
        border: 'none',
        borderRadius: '6px',
        opacity: 0.9,
      }
    };
  };

  if (user?.role !== 'parent') {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Dành riêng cho Phụ huynh.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white tracking-tight flex items-center gap-3" style={{ fontWeight: 300 }}>
            <CalendarIcon size={32} className="text-ps-blue" />
            Lịch học của con
          </h1>
          <p className="text-gray-400 mt-1">
            Theo dõi thời khóa biểu học tập của các bé
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
        <div className="text-center py-20 text-gray-400">Đang tải dữ liệu lịch học...</div>
      ) : childrenData.length === 0 ? (
        <div className="bg-surface-dark-card rounded-xl p-12 text-center border border-gray-800">
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

          {/* Calendar Area */}
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-[#f9fafb] border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-[#374151] font-semibold text-lg flex items-center gap-2">
                Thời khóa biểu - <span className="text-ps-blue">{childrenData[activeChildIndex].student.fullName}</span>
              </h3>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-ps-blue"></div> Chính</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div> Bù</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Đã học</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Đã hủy</span>
              </div>
            </div>
            
            <div className="p-4 h-150">
              <style>{`
                .schedule-calendar-light .rbc-month-view,
                .schedule-calendar-light .rbc-time-view,
                .schedule-calendar-light .rbc-agenda-view {
                  background-color: #ffffff;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                }
                .schedule-calendar-light .rbc-off-range-bg {
                  background: #f9fafb;
                }
                .schedule-calendar-light .rbc-today {
                  background: #eff6ff;
                }
                .schedule-calendar-light .rbc-header {
                  background: #f9fafb;
                  border-bottom: 1px solid #e5e7eb !important;
                  padding: 10px 8px;
                  font-weight: 600;
                  font-size: 13px;
                  color: #374151;
                  text-transform: capitalize;
                }
                .schedule-calendar-light .rbc-event {
                  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                  border: none;
                }
                .schedule-calendar-light .rbc-toolbar button {
                  color: #374151;
                  border: 1px solid #d1d5db;
                  border-radius: 8px;
                  padding: 6px 14px;
                  font-size: 13px;
                  font-weight: 500;
                  background: #ffffff;
                  transition: all 0.15s;
                }
                .schedule-calendar-light .rbc-toolbar button:hover {
                  background: #f3f4f6;
                }
                .schedule-calendar-light .rbc-toolbar button.rbc-active {
                  background: #0070d1;
                  color: #ffffff;
                  border-color: #0070d1;
                }
              `}</style>
              <Calendar
                localizer={localizer}
                events={activeEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                className="schedule-calendar-light font-sans text-sm"
                eventPropGetter={eventPropGetter}
                date={currentDate}
                onNavigate={handleNavigate}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="week"
                messages={{
                  next: "Tiếp",
                  previous: "Trước",
                  today: "Hôm nay",
                  month: "Tháng",
                  week: "Tuần",
                  day: "Ngày",
                  agenda: "Lịch trình",
                  date: "Ngày",
                  time: "Thời gian",
                  event: "Buổi học",
                  noEventsInRange: "Bé chưa có lịch học nào trong thời gian này.",
                }}
                min={new Date(2025, 0, 1, 7, 0)} // Start at 7 AM
                max={new Date(2025, 0, 1, 22, 0)} // End at 10 PM
                tooltipAccessor={(event) => 
                  `Lớp: ${event.resource.classId?.classCode}\n` +
                  `Giáo viên: ${event.resource.teacherId?.userId?.fullName || 'Đang cập nhật'}\n` +
                  `Phòng: ${event.resource.classId?.room || 'Đang cập nhật'}`
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
