import { useState, useEffect } from "react";
import {
  CheckSquareOffset,
  Chalkboard,
  Calendar,
  Users,
  CheckCircle,
  WarningCircle,
  XCircle,
} from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function Attendance() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [enrollments, setEnrollments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId -> { status, notes }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1. Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/classes?limit=200");
        setClasses(data.classes || data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi kết nối khi tải lớp học");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user]);

  // 2. Fetch schedules and enrollments when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchData = async () => {
      setSchedules([]);
      setSelectedSchedule(null);
      setEnrollments([]);
      setLoading(true);
      try {
        // Fetch schedules
        const { data: scheduleData } = await api.get(
          `/schedules/class/${selectedClass._id}`
        );

        // Fetch enrollments
        const { data: enrollData } = await api.get(
          `/enrollments/class/${selectedClass._id}/students`
        );

        const sortedSchedules = (scheduleData.schedules || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setSchedules(sortedSchedules);
        setEnrollments(enrollData.students || []);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải dữ liệu lớp học");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass]);

  // 3. Fetch attendance when schedule is selected
  useEffect(() => {
    if (!selectedSchedule) return;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/attendances/schedule/${selectedSchedule._id}`
        );

        const existingAttendances = data.attendances || [];
        setAttendanceData(existingAttendances);

        const initialRecords = {};
        enrollments.forEach((enroll) => {
          const studentId = enroll.studentId._id;
          const existing = existingAttendances.find(
            (a) => a.studentId._id === studentId
          );

          if (existing) {
            initialRecords[studentId] = {
              status: existing.status,
              notes: existing.notes || "",
            };
          } else {
            initialRecords[studentId] = { status: "present", notes: "" };
          }
        });
        setAttendanceRecords(initialRecords);
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi khi tải danh sách điểm danh");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedSchedule, enrollments]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSchedule) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const studentsToSave = Object.keys(attendanceRecords).map(
        (studentId) => ({
          studentId,
          status: attendanceRecords[studentId].status,
          notes: attendanceRecords[studentId].notes,
        })
      );

      const { data } = await api.post("/attendances/bulk", {
        scheduleId: selectedSchedule._id,
        students: studentsToSave,
      });

      setSuccess(data.message || "Lưu điểm danh thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  if (!["admin", "teacher"].includes(user?.role)) {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl text-white tracking-tight flex items-center gap-3"
            style={{ fontWeight: 300 }}
          >
            <CheckSquareOffset size={32} className="text-ps-blue" />
            Điểm danh
          </h1>
          <p className="text-gray-400 mt-1">
            Quản lý điểm danh học sinh cho từng buổi học
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] px-4 py-3 rounded-[8px] flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] px-4 py-3 rounded-[8px] flex items-center gap-2">
          <CheckCircle size={20} />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Class and Schedule Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1b1e] rounded-[12px] p-4 border border-gray-800">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Chalkboard size={20} className="text-ps-blue" />
              1. Chọn Lớp học
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loading && !classes.length && (
                <p className="text-gray-500 text-sm">Đang tải...</p>
              )}
              {classes.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedClass(c)}
                  className={`w-full text-left px-4 py-3 rounded-[8px] transition-colors text-sm ${
                    selectedClass?._id === c._id
                      ? "bg-ps-blue text-white"
                      : "bg-[#121314] text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <div className="font-medium">{c.classCode}</div>
                  <div
                    className={`text-xs mt-1 ${selectedClass?._id === c._id ? "text-blue-100" : "text-gray-500"}`}
                  >
                    {c.courseId?.name || "Khóa học"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className={`bg-[#1a1b1e] rounded-[12px] p-4 border border-gray-800 transition-opacity ${!selectedClass ? "opacity-50 pointer-events-none" : ""}`}
          >
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-ps-blue" />
              2. Chọn Buổi học
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {!selectedClass ? (
                <p className="text-gray-500 text-sm italic">
                  Vui lòng chọn lớp học trước
                </p>
              ) : schedules.length === 0 && !loading ? (
                <p className="text-gray-500 text-sm">
                  Lớp chưa có buổi học nào
                </p>
              ) : (
                schedules.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSchedule(s)}
                    className={`w-full text-left px-4 py-3 rounded-[8px] transition-colors text-sm ${
                      selectedSchedule?._id === s._id
                        ? "bg-ps-blue text-white"
                        : "bg-[#121314] text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    }`}
                  >
                    <div className="font-medium">Buổi {s.sessionNumber}</div>
                    <div
                      className={`text-xs mt-1 flex justify-between ${selectedSchedule?._id === s._id ? "text-blue-100" : "text-gray-500"}`}
                    >
                      <span>
                        {new Date(s.date).toLocaleDateString("vi-VN")}
                      </span>
                      <span>
                        {s.startTime} - {s.endTime}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Table */}
        <div className="lg:col-span-3">
          <div
            className={`bg-[#1a1b1e] rounded-[12px] overflow-hidden border border-gray-800 h-full flex flex-col transition-opacity ${!selectedSchedule ? "opacity-50 pointer-events-none" : ""}`}
          >
            {/* Table Header */}
            <div className="p-6 bg-[#121314] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ps-blue/10 flex items-center justify-center text-ps-blue">
                  <Users size={24} weight="fill" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">
                    {selectedSchedule
                      ? `Điểm danh - Buổi ${selectedSchedule.sessionNumber}`
                      : "Danh sách điểm danh"}
                  </h2>
                  {selectedSchedule && (
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(selectedSchedule.date).toLocaleDateString(
                        "vi-VN",
                      )}{" "}
                      | {selectedSchedule.startTime} -{" "}
                      {selectedSchedule.endTime}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleSaveAttendance}
                disabled={saving || enrollments.length === 0}
                className="bg-ps-blue text-white px-6 py-2 rounded-full font-medium hover:bg-ps-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Lưu Điểm danh"}
              </button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-x-auto">
              {!selectedSchedule ? (
                <div className="h-full min-h-[400px] flex items-center justify-center text-gray-500 flex-col gap-3">
                  <Calendar size={48} className="text-gray-700" />
                  <p>Vui lòng chọn Buổi học để điểm danh</p>
                </div>
              ) : loading ? (
                <div className="p-8 text-center text-gray-500">
                  Đang tải danh sách...
                </div>
              ) : enrollments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Lớp học chưa có học sinh nào.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1a1b1e] text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Mã HS</th>
                      <th className="px-6 py-4 font-medium">Họ tên</th>
                      <th className="px-6 py-4 font-medium text-center">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 font-medium">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {enrollments.map((enroll, idx) => {
                      const student = enroll.studentId;
                      const record = attendanceRecords[student._id] || {
                        status: "present",
                        notes: "",
                      };

                      return (
                        <tr
                          key={student._id}
                          className="hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-400">
                            {student.studentCode}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {student.userId?.fullName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`status-${student._id}`}
                                  value="present"
                                  checked={record.status === "present"}
                                  onChange={() =>
                                    handleStatusChange(student._id, "present")
                                  }
                                  className="w-4 h-4 text-[#10b981] bg-gray-700 border-gray-600 focus:ring-[#10b981]"
                                />
                                <span
                                  className={`text-sm ${record.status === "present" ? "text-[#10b981] font-medium" : "text-gray-400"}`}
                                >
                                  Có mặt
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`status-${student._id}`}
                                  value="absent"
                                  checked={record.status === "absent"}
                                  onChange={() =>
                                    handleStatusChange(student._id, "absent")
                                  }
                                  className="w-4 h-4 text-[#ef4444] bg-gray-700 border-gray-600 focus:ring-[#ef4444]"
                                />
                                <span
                                  className={`text-sm ${record.status === "absent" ? "text-[#ef4444] font-medium" : "text-gray-400"}`}
                                >
                                  Vắng mặt
                                </span>
                              </label>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={record.notes}
                              onChange={(e) =>
                                handleNotesChange(student._id, e.target.value)
                              }
                              placeholder="Có phép / Không phép..."
                              className="w-full bg-[#121314] text-white border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ps-blue"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
