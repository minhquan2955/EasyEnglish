import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import vi from 'date-fns/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, WarningCircle } from '@phosphor-icons/react';
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

export default function MySchedule() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchMySchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/schedules/my-schedule');
      const formattedEvents = data.schedules.map(session => {
        const startDate = new Date(`${session.date.split('T')[0]}T${session.startTime}`);
        const endDate = new Date(`${session.date.split('T')[0]}T${session.endTime}`);
        return {
          id: session._id,
          title: `Buổi ${session.sessionNumber || '?'} | ${session.classId?.classCode || ''}${session.classId?.room ? ' | ' + session.classId.room : ''}${session.topic ? ' - ' + session.topic : ''}`,
          start: startDate,
          end: endDate,
          resource: session,
          type: session.status
        };
      });
      setEvents(formattedEvents);

      if (formattedEvents.length > 0) {
          const now = new Date();
          const futureEvents = formattedEvents.filter(e => e.start >= now);
          if (futureEvents.length > 0) {
              const earliest = futureEvents.reduce((a, b) => a.start < b.start ? a : b);
              setCurrentDate(earliest.start);
          } else {
              const latest = formattedEvents.reduce((a, b) => a.start > b.start ? a : b);
              setCurrentDate(latest.start);
          }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi kết nối khi tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySchedule();
  }, []);

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
        borderRadius: '5px',
        padding: '2px 5px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
        cursor: 'default',
      }
    };
  };

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
            <CalendarIcon size={32} className="text-ps-blue" />
            Lịch học của tôi
          </h1>
          <p className="text-gray-400 mt-1">
            Xem lịch học chi tiết của các lớp bạn đang tham gia
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] px-4 py-3 rounded-[8px] flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Calendar Area */}
      <div className="bg-white rounded-[12px] overflow-hidden shadow-2xl border border-gray-200">
        <div className="p-4 bg-[#f9fafb] border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-[#374151] font-semibold text-lg">Thời khóa biểu</h3>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#0070d1]"></div> Lịch học chính</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div> Lịch học bù</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Đã học</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Đã hủy</span>
          </div>
        </div>
        
        {loading ? (
          <div className="h-[600px] flex items-center justify-center text-gray-500">
            Đang tải lịch học...
          </div>
        ) : (
          <div className="p-4 h-[600px]">
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
                transition: box-shadow 0.1s;
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
              }
              .schedule-calendar-light .rbc-event:hover {
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
              }
              .schedule-calendar-light .rbc-event-label {
                font-size: 9px;
                opacity: 0.85;
                font-weight: 500;
                letter-spacing: 0.02em;
              }
              .schedule-calendar-light .rbc-event-content {
                font-size: 11px;
                font-weight: 600;
                line-height: 1.35;
                word-break: break-word;
                overflow-wrap: break-word;
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
              events={events}
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
                noEventsInRange: "Bạn không có lịch học nào trong thời gian này.",
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
        )}
      </div>
    </div>
  );
}
