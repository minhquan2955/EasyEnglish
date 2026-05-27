import Attendance from "../models/Attendance.js";
import Schedule from "../models/Schedule.js";
import Enrollment from "../models/Enrollment.js";

/**
 * Điểm danh hàng loạt cho một buổi học
 *
 * @param {Object} params
 * @param {String} params.scheduleId  - ID buổi học
 * @param {Array}  params.students    - Mảng { studentId, status, notes }
 * @param {String} params.checkedInBy - userId của người điểm danh (giáo viên)
 * @returns {Object} - Kết quả điểm danh
 */
export const bulkCheckIn = async ({ scheduleId, students, checkedInBy }) => {
  // --- 1. Kiểm tra buổi học tồn tại ---
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new Error("Không tìm thấy buổi học");
  }

  // --- 2. Kiểm tra buổi học có phải trạng thái phù hợp không ---
  if (schedule.status === "cancelled") {
    throw new Error("Buổi học đã bị hủy, không thể điểm danh");
  }

  // --- 3. Lấy classId từ schedule ---
  const classId = schedule.classId;

  // --- 4. Kiểm tra tất cả studentId có thuộc lớp này không ---
  const studentIds = students.map((s) => s.studentId);
  const validEnrollments = await Enrollment.find({
    classId,
    studentId: { $in: studentIds },
    status: "active",
  });

  // Tạo Set để kiểm tra nhanh O(1)
  const validStudentIds = new Set(
    validEnrollments.map((e) => e.studentId.toString()),
  );

  // Lọc ra những HS không hợp lệ
  const invalidStudents = studentIds.filter(
    (id) => !validStudentIds.has(id.toString()),
  );
  if (invalidStudents.length > 0) {
    throw new Error(
      `${invalidStudents.length} học sinh không thuộc lớp này: ${invalidStudents.join(", ")}`,
    );
  }

  // --- 5. Tạo/Cập nhật bản ghi điểm danh ---
  //bulkWrite() — thao tác hàng loạt với điều kiện (Dùng khi dữ liệu có thể đã tồn tại (điểm danh lại, sửa điểm danh))
  // upsert = UPDATE + INSERT:
  const now = new Date();

  const bulkOps = students.map((s) => ({
    updateOne: {
      // Điều kiện tìm: cùng buổi học + cùng học sinh
      filter: { scheduleId, studentId: s.studentId },
      // Dữ liệu cập nhật/tạo mới
      update: {
        $set: {
          classId,
          status: s.status,
          checkedInAt: now,
          checkedInBy,
          notes: s.notes || null,
        },
      },
      upsert: true, //INSERT nếu chưa có, UPDATE nếu đã có
    },
  }));

  const result = await Attendance.bulkWrite(bulkOps);

  return {
    totalProcessed: students.length,
    created: result.upsertedCount,
    updated: result.modifiedCount,
  };
};
