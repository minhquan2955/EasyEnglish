import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import vi from 'date-fns/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarBlank, Plus, ListBullets, PencilSimple, X, Lightning, Clock, MapPin, BookOpen, Tag } from '@phosphor-icons/react';
import api from '../api';

const locales = { vi };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const STATUS_COLORS = {
  scheduled: { bg: '#0070d1', text: '#ffffff', label: 'Đã lên lịch' },
  completed: { bg: '#00a854', text: '#ffffff', label: 'Đã hoàn thành' },
  cancelled: { bg: '#c81b3a', text: '#ffffff', label: 'Đã hủy' },
  makeup:    { bg: '#e6a817', text: '#000000', label: 'Học bù' },
};

import { useAuth } from '../context/AuthContext';

export default function Schedule() {
  const { user } = useAuth();
  // Admin defaults to 'list', Teacher defaults to 'calendar'
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'list' : 'calendar');
  const [summaries, setSummaries] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  
  // Calendar state
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [events, setEvents] = useState([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Edit modal
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({ startTime: '', endTime: '', room: '', topic: '', status: 'scheduled' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Generate state
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  // Fetch summary list
  const fetchSummaries = async () => {
    setLoadingList(true);
    try {
      const { data } = await api.get('/admin/schedules');
      setSummaries(data.schedules || []);
    } catch (err) { console.error(err); }
    finally { setLoadingList(false); }
  };

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes?limit=200');
      setClasses(data.classes || data || []);
    } catch (err) { console.error(err); }
  };

  // Fetch schedules for a class
  const fetchClassSchedules = useCallback(async (classId) => {
    if (!classId) { setEvents([]); return; }
    setLoadingCal(true);
    try {
      const { data } = await api.get(`/schedules/class/${classId}`);
      const mapped = (data.schedules || []).map(s => {
        const dateStr = new Date(s.date).toISOString().split('T')[0];
        return {
          id: s._id,
          title: `Buổi ${s.sessionNumber}${s.classId?.classCode ? ' | ' + s.classId.classCode : ''}${s.room ? ' | ' + s.room : ''}${s.topic ? ' - ' + s.topic : ''}`,
          start: new Date(`${dateStr}T${s.startTime}:00`),
          end: new Date(`${dateStr}T${s.endTime}:00`),
          resource: s,
        };
      });
      setEvents(mapped);
      if (mapped.length > 0) {
        setCurrentDate(mapped[0].start);
      } else {
        setCurrentDate(new Date());
      }
    } catch (err) { console.error(err); }
    finally { setLoadingCal(false); }
  }, []);

  useEffect(() => {
    fetchClasses(); // Always load classes for both tabs
    if (activeTab === 'list') fetchSummaries();
  }, [activeTab]);

  useEffect(() => {
    if (selectedClassId) fetchClassSchedules(selectedClassId);
  }, [selectedClassId, fetchClassSchedules]);

  // Generate batch schedule
  const handleGenerate = async (classId) => {
    setGenerating(true);
    setGenMsg('');
    try {
      const { data } = await api.post('/admin/schedules/generate', { classId });
      setGenMsg(data.message);
      fetchSummaries();
    } catch (err) {
      setGenMsg(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Edit modal handlers
  const handleEventClick = (event) => {
    const s = event.resource;
    setEditingSession(s);
    setEditForm({
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || '',
      topic: s.topic || '',
      status: s.status,
    });
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const url = user?.role === 'admin' ? `/admin/schedules/${editingSession._id}` : `/schedules/${editingSession._id}`;
      await api.put(url, editForm);
      setEditSuccess('Cập nhật thành công!');
      fetchClassSchedules(selectedClassId);
    } catch (err) { setEditError(err.response?.data?.message || err.message); }
    finally { setEditLoading(false); }
  };

  // Custom event style for calendar
  const isAdmin = user?.role === 'admin';
  const eventStyleGetter = (event) => {
    const status = event.resource?.status || 'scheduled';
    const color = STATUS_COLORS[status] || STATUS_COLORS.scheduled;
    return {
      style: {
        backgroundColor: color.bg,
        color: color.text,
        borderRadius: '5px',
        border: 'none',
        padding: '2px 5px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
        cursor: isAdmin ? 'pointer' : 'default',
      },
    };
  };

  // Custom messages (Vietnamese)
  const messages = {
    today: 'Hôm nay',
    previous: '← Trước',
    next: 'Sau →',
    week: 'Tuần',
    day: 'Ngày',
    month: 'Tháng',
    agenda: 'Lịch trình',
    noEventsInRange: 'Không có buổi học nào trong khoảng thời gian này.',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl mb-2 text-white" style={{ fontWeight: 300, letterSpacing: '0.1px' }}>
            Quản lý Lịch học
          </h1>
          <p className="text-gray-400">Tạo và theo dõi lịch học của các lớp.</p>
        </div>

        {user?.role === 'admin' && (
          <div className="flex bg-black p-1 rounded-full border border-gray-800">
            <button
              onClick={() => setActiveTab('list')}
              className="px-6 py-2 text-sm transition-all duration-200"
              style={{
                borderRadius: '9999px',
                backgroundColor: activeTab === 'list' ? '#0070d1' : 'transparent',
                color: activeTab === 'list' ? '#ffffff' : '#a1a1aa',
                fontWeight: activeTab === 'list' ? 500 : 400
              }}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-6 py-2 text-sm transition-all duration-200"
              style={{
                borderRadius: '9999px',
                backgroundColor: activeTab === 'calendar' ? '#0070d1' : 'transparent',
                color: activeTab === 'calendar' ? '#ffffff' : '#a1a1aa',
                fontWeight: activeTab === 'calendar' ? 500 : 400
              }}
            >
              Lịch tuần
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Summary List */}
      {activeTab === 'list' && (
        <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ListBullets size={24} className="text-ps-blue" />
              <h2 className="text-xl" style={{ fontWeight: 300 }}>Tổng quan Lịch học</h2>
            </div>
          </div>

          {genMsg && (
            <div className={`mb-4 p-4 rounded-[4px] text-sm ${genMsg.startsWith('❌') ? 'bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a]' : 'bg-[#00a854]/10 border border-[#00a854]/20 text-[#00a854]'}`}>
              {genMsg}
            </div>
          )}

          {loadingList ? (
            <div className="text-center py-10 text-gray-500">Đang tải...</div>
          ) : (
            <>
              {/* Classes without schedules */}
              {classes.length === 0 && summaries.length === 0 && (
                <div className="text-center py-10 text-gray-500">Chưa có lịch học nào được tạo.</div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="pb-3 font-medium">Mã lớp</th>
                      <th className="pb-3 font-medium">Khóa học</th>
                      <th className="pb-3 font-medium">Tổng buổi</th>
                      <th className="pb-3 font-medium">Đã lên lịch</th>
                      <th className="pb-3 font-medium">Hoàn thành</th>
                      <th className="pb-3 font-medium">Đã hủy</th>
                      <th className="pb-3 font-medium">Ngày bắt đầu</th>
                      <th className="pb-3 font-medium">Ngày kết thúc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.length === 0 ? (
                      <tr><td colSpan="8" className="py-8 text-center text-gray-500">Chưa có lịch nào. Hãy chọn một lớp ở bên dưới để tạo lịch.</td></tr>
                    ) : (
                      summaries.map((s) => (
                        <tr key={s.classId} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                          <td className="py-4 text-white font-medium">{s.classCode}</td>
                          <td className="py-4 text-gray-300">{s.courseName || '-'}</td>
                          <td className="py-4 text-gray-300">{s.totalSessions}</td>
                          <td className="py-4"><span className="text-ps-blue font-medium">{s.scheduled}</span></td>
                          <td className="py-4"><span className="text-[#00a854] font-medium">{s.completed}</span></td>
                          <td className="py-4"><span className="text-[#c81b3a] font-medium">{s.cancelled}</span></td>
                          <td className="py-4 text-gray-400">{s.firstDate ? new Date(s.firstDate).toLocaleDateString('vi-VN') : '-'}</td>
                          <td className="py-4 text-gray-400">{s.lastDate ? new Date(s.lastDate).toLocaleDateString('vi-VN') : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Generate section */}
              <div className="mt-8 p-6 bg-black border border-gray-800 rounded-[8px]">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Lightning size={20} className="text-ps-blue" />
                  Tạo lịch hàng loạt cho lớp
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Chọn một lớp bên dưới → hệ thống sẽ tự động tạo tất cả buổi học dựa trên thông tin ngày học (daysOfWeek), ngày bắt đầu/kết thúc của lớp.
                </p>
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm text-gray-300 mb-1">Chọn lớp</label>
                    <select
                      id="generate-class-select"
                      className="w-full h-12 px-4 bg-[#121314] border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none"
                      defaultValue=""
                      onChange={(e) => {/* just for form */}}
                    >
                      <option value="" disabled>-- Chọn lớp --</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.classCode}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    disabled={generating}
                    onClick={() => {
                      const select = document.getElementById('generate-class-select');
                      if (select.value) handleGenerate(select.value);
                    }}
                    className="h-12 px-6 bg-ps-blue text-white rounded-full font-bold text-sm hover:bg-[#0064b7] active:bg-[#004d8d] transition-colors disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={18} weight="bold" />
                    {generating ? 'Đang tạo...' : 'Tạo lịch'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Calendar View */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Class selector */}
          <div className="bg-[#121314] rounded-[8px] border border-gray-800 p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarBlank size={24} className="text-ps-blue" />
                <h2 className="text-xl" style={{ fontWeight: 300 }}>Lịch tuần</h2>
              </div>
              <div className="flex-1 min-w-[200px] max-w-xs">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 px-4 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors appearance-none text-sm"
                >
                  <option value="">-- Chọn lớp để xem lịch --</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.classCode}</option>
                  ))}
                </select>
              </div>

              {/* Legend */}
              <div className="flex gap-3 ml-auto text-xs">
                {Object.entries(STATUS_COLORS).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: val.bg }}></span>
                    <span className="text-gray-400">{val.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-[8px] border border-gray-800 overflow-hidden">
            {loadingCal ? (
              <div className="text-center py-20 text-gray-500 bg-[#121314]">Đang tải lịch...</div>
            ) : !selectedClassId ? (
              <div className="text-center py-20 text-gray-500 bg-[#121314]">
                Hãy chọn một lớp ở trên để xem lịch tuần.
              </div>
            ) : (
              <div className="schedule-calendar-light" style={{ height: 650 }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  date={currentDate}
                  onNavigate={(newDate) => setCurrentDate(newDate)}
                  defaultView="week"
                  views={['week', 'day', 'agenda']}
                  step={30}
                  timeslots={2}
                  min={new Date(2025, 0, 1, 6, 0)}
                  max={new Date(2025, 0, 1, 22, 0)}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={isAdmin ? handleEventClick : undefined}
                  selectable={isAdmin}
                  messages={messages}
                  culture="vi"
                  style={{ height: '100%' }}
                  formats={{
                    dayHeaderFormat: (date) => format(date, 'EEEE, dd/MM', { locale: vi }),
                    dayRangeHeaderFormat: ({ start, end }) =>
                      `${format(start, 'dd/MM', { locale: vi })} – ${format(end, 'dd/MM', { locale: vi })}`,
                    timeGutterFormat: (date) => format(date, 'HH:mm'),
                    eventTimeRangeFormat: ({ start, end }) =>
                      `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditingSession(null)}>
          <div className="bg-[#1a1b1e] rounded-[12px] border border-gray-700 p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-white" style={{ fontWeight: 300 }}>
                Chỉnh sửa Buổi #{editingSession.sessionNumber}
              </h3>
              <button onClick={() => setEditingSession(null)} className="p-1 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Ngày: <span className="text-white">{new Date(editingSession.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </p>

            {editError && <div className="mb-4 p-3 bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] rounded-[4px] text-sm">{editError}</div>}
            {editSuccess && <div className="mb-4 p-3 bg-[#00a854]/10 border border-[#00a854]/20 text-[#00a854] rounded-[4px] text-sm">{editSuccess}</div>}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1"><Clock size={14} className="inline mr-1" />Giờ bắt đầu</label>
                  <input type="time" value={editForm.startTime} onChange={(e) => setEditForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full h-10 px-3 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1"><Clock size={14} className="inline mr-1" />Giờ kết thúc</label>
                  <input type="time" value={editForm.endTime} onChange={(e) => setEditForm(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full h-10 px-3 bg-black border border-gray-800 rounded-[4px] text-white focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors" style={{ colorScheme: 'dark' }} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1"><MapPin size={14} className="inline mr-1" />Phòng học</label>
                <input type="text" value={editForm.room} onChange={(e) => setEditForm(p => ({ ...p, room: e.target.value }))}
                  className="w-full h-10 px-3 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                  placeholder="VD: P.201" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1"><BookOpen size={14} className="inline mr-1" />Chủ đề / Nội dung</label>
                <input type="text" value={editForm.topic} onChange={(e) => setEditForm(p => ({ ...p, topic: e.target.value }))}
                  className="w-full h-10 px-3 bg-black border border-gray-800 rounded-[4px] text-white placeholder:text-gray-600 focus:outline-none focus:border-ps-blue focus:ring-1 focus:ring-ps-blue transition-colors"
                  placeholder="VD: Unit 1 - Greetings" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1"><Tag size={14} className="inline mr-1" />Trạng thái</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(STATUS_COLORS).map(([key, val]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setEditForm(p => ({ ...p, status: key }))}
                      className="py-2 text-xs font-medium rounded-[4px] border-2 transition-all"
                      style={{
                        backgroundColor: editForm.status === key ? val.bg : 'transparent',
                        color: editForm.status === key ? val.text : val.bg,
                        borderColor: val.bg,
                      }}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={editLoading}
                  className="w-full h-12 bg-ps-blue text-white rounded-full font-bold text-sm hover:bg-[#0064b7] active:bg-[#004d8d] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {editLoading ? 'Đang lưu...' : <><PencilSimple size={18} weight="bold" /> Cập nhật buổi học</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Light theme CSS override for react-big-calendar */}
      <style>{`
        .schedule-calendar-light {
          background: #ffffff;
          border-radius: 8px;
          padding: 16px;
        }
        .schedule-calendar-light .rbc-calendar {
          font-family: inherit;
          color: #1a1a2e;
        }
        .schedule-calendar-light .rbc-toolbar {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
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
          border-color: #9ca3af;
        }
        .schedule-calendar-light .rbc-toolbar button.rbc-active {
          background: #0070d1;
          color: #ffffff;
          border-color: #0070d1;
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
        .schedule-calendar-light .rbc-header + .rbc-header {
          border-left: 1px solid #e5e7eb !important;
        }
        .schedule-calendar-light .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .schedule-calendar-light .rbc-time-header {
          border-bottom: 1px solid #e5e7eb;
        }
        .schedule-calendar-light .rbc-time-content {
          border-top: none;
        }
        .schedule-calendar-light .rbc-time-content > * + * > * {
          border-left: 1px solid #f3f4f6;
        }
        .schedule-calendar-light .rbc-timeslot-group {
          border-bottom: 1px solid #f3f4f6;
          min-height: 50px;
        }
        .schedule-calendar-light .rbc-time-slot {
          border-top: none;
        }
        .schedule-calendar-light .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: 1px solid #e5e7eb;
        }
        .schedule-calendar-light .rbc-label {
          font-size: 11px;
          color: #9ca3af;
          padding: 4px 8px;
          font-weight: 500;
        }
        .schedule-calendar-light .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f9fafb;
        }
        .schedule-calendar-light .rbc-today {
          background: #eff6ff;
        }
        .schedule-calendar-light .rbc-current-time-indicator {
          background: #0070d1;
          height: 2px;
        }
        .schedule-calendar-light .rbc-event {
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          transition: transform 0.1s, box-shadow 0.1s;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
          text-overflow: ellipsis;
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
        .schedule-calendar-light .rbc-show-more {
          color: #0070d1;
          font-weight: 500;
          font-size: 12px;
        }
        .schedule-calendar-light .rbc-agenda-view table {
          border-collapse: collapse;
        }
        .schedule-calendar-light .rbc-agenda-view .rbc-agenda-table {
          border: 1px solid #e5e7eb;
        }
        .schedule-calendar-light .rbc-agenda-view .rbc-agenda-table thead th {
          background: #f9fafb;
          padding: 10px;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        .schedule-calendar-light .rbc-agenda-view .rbc-agenda-table tbody td {
          padding: 8px 10px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
        }
        .schedule-calendar-light .rbc-allday-cell {
          display: none;
        }
        .schedule-calendar-light .rbc-time-header-content > .rbc-row.rbc-row-resource {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
