import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { UserCircle, Books, ChalkboardTeacher, CalendarBlank, WarningCircle, Money } from "@phosphor-icons/react";

export default function ChildrenClasses() {
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState([]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChildrenClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/enrollments/my-children");
      setChildrenData(data.children || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi kết nối khi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildrenClasses();
  }, []);

  if (user?.role !== "parent") {
    return (
      <div className="p-8 text-center text-gray-400">
        Bạn không có quyền truy cập trang này. Dành riêng cho Phụ huynh.
      </div>
    );
  }

  const activeChild = childrenData[activeChildIndex];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2 text-white flex items-center gap-3" style={{ fontWeight: 300, letterSpacing: "0.1px" }}>
          <Books size={40} className="text-ps-blue" />
          Lớp học của con
        </h1>
        <p className="text-gray-400">
          Xem thông tin chi tiết các lớp học mà con bạn đang tham gia.
        </p>
      </div>

      {error && (
        <div className="bg-[#c81b3a]/10 border border-[#c81b3a]/20 text-[#c81b3a] px-4 py-3 rounded-[8px] flex items-center gap-2">
          <WarningCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải dữ liệu lớp học...</div>
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
                    ? "text-ps-blue" 
                    : "text-gray-400 hover:text-gray-200"
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

          {/* Classes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {activeChild?.enrollments.length === 0 ? (
              <div className="col-span-full bg-[#121314] rounded-[8px] border border-gray-800 p-8 text-center text-gray-500">
                <Books size={48} className="mx-auto mb-4 text-gray-600" />
                Bé chưa đăng ký lớp học nào.
              </div>
            ) : (
              activeChild?.enrollments.map((enrollment) => {
                const classData = enrollment.classId;
                const course = classData?.courseId;
                const teacher = classData?.teacherId;

                return (
                  <div key={enrollment._id} className="bg-[#121314] rounded-[8px] border border-gray-800 p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl text-white font-medium mb-1">
                          {course?.name || "Lớp học"}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Mã lớp: <span className="text-white">{classData?.classCode}</span>
                        </p>
                      </div>
                      <span className="bg-green-400/10 text-green-400 border border-green-400/30 px-3 py-1 rounded-full text-xs">
                        Đang học
                      </span>
                    </div>

                    <div className="text-gray-400 text-sm mb-6 flex-grow">
                      {course?.description || "Khoá học chất lượng cao tại trung tâm."}
                    </div>

                    <div className="space-y-3 mt-auto pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-3 text-sm">
                        <ChalkboardTeacher size={18} className="text-ps-blue" />
                        <span className="text-gray-400 w-24">Giáo viên:</span>
                        <span className="text-white font-medium">{teacher?.userId?.fullName || "Đang cập nhật"}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <CalendarBlank size={18} className="text-ps-blue" />
                        <span className="text-gray-400 w-24">Lịch học:</span>
                        <span className="text-white font-medium">
                          {classData?.schedule?.daysOfWeek?.length > 0 
                            ? classData.schedule.daysOfWeek.map(d => d === 0 ? "CN" : `T${d+1}`).join(", ") 
                            : "Chưa xếp lịch"}
                          {classData?.schedule?.startTime && ` (${classData.schedule.startTime} - ${classData.schedule.endTime})`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Money size={18} className="text-ps-blue" />
                        <span className="text-gray-400 w-24">Học phí:</span>
                        <span className="text-white font-medium">
                          {course?.tuitionFee ? `${course.tuitionFee.toLocaleString("vi-VN")} đ` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
