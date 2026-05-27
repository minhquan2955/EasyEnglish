import Schedule from "../models/Schedule.js";
import Class from "../models/Class.js";

/**
 * Input:
 *   - Class.startDate = "2026-06-01"
 *   - Class.endDate   = "2026-08-31"
 *   - Class.schedule.daysOfWeek = [1, 3, 5]  (Thứ 2, 4, 6)
 *   - Course.totalSessions = 30
 *
 * Thuật toán:
 *   1. Bắt đầu từ startDate, duyệt từng ngày
 *   2. Kiểm tra ngày hiện tại có nằm trong daysOfWeek không?
 *      - Nếu CÓ => thêm vào danh sách buổi học, tăng sessionNumber
 *      - Nếu KHÔNG => bỏ qua, đi tiếp ngày hôm sau
 *   3. Dừng khi đã đủ totalSessions HOẶC vượt quá endDate
 *
 * Output: Mảng 30 objects Schedule, mỗi object có date, sessionNumber, startTime, endTime, room
 */

/**
 * Sinh tất cả buổi học cho một lớp
 * @param {String} classId - ID của lớp cần sinh lịch
 * @returns {Array} - Mảng các buổi học đã được tạo
 */
export const generateScheduleForClass = async (classId) => {
  // --- 1. Lấy thông tin lớp học ---
  const classDoc = await Class.findById(classId).populate("courseId");
  if (!classDoc) {
    throw new Error("Không tìm thấy lớp học");
  }

  // --- 2. Validate: lớp có đủ thông tin để sinh lịch không? ---
  if (!classDoc.startDate || !classDoc.endDate) {
    throw new Error("Lớp chưa có ngày bắt đầu/kết thúc");
  }
  if (
    !classDoc.schedule ||
    !classDoc.schedule.daysOfWeek ||
    classDoc.schedule.daysOfWeek.length === 0
  ) {
    throw new Error("Lớp chưa có lịch học (daysOfWeek)");
  }

  const course = classDoc.courseId; // Đã populate
  if (!course) {
    throw new Error("Không tìm thấy khóa học liên kết");
  }

  // --- 3. Kiểm tra đã sinh lịch chưa (tránh sinh trùng) ---
  const existingCount = await Schedule.countDocuments({ classId });
  if (existingCount > 0) {
    throw new Error(
      `Lớp này đã có ${existingCount} buổi học. Hãy xóa lịch cũ trước khi sinh lại.`,
    );
  }

  // --- 4. Thuật toán sinh ngày ---
  const { daysOfWeek, startTime, endTime } = classDoc.schedule;
  const totalSessions = course.totalSessions;

  const schedules = []; // Mảng chứa các buổi học sẽ tạo
  let sessionNumber = 1;

  //Date manipulation trong JavaScript
  //
  // new Date(classDoc.startDate) — tạo bản sao để không ảnh hưởng đến DB
  // currentDate.getDay()         — lấy thứ trong tuần (0=CN, 1=T2, ..., 6=T7)
  // currentDate.setDate(...)     — di chuyển đến ngày tiếp theo
  //
  //JavaScript Date object là MUTABLE (thay đổi trực tiếp)
  //khác với String/Number là immutable. Nên cần tạo bản sao bằng new Date().
  let currentDate = new Date(classDoc.startDate);
  const endDate = new Date(classDoc.endDate);

  while (currentDate <= endDate && sessionNumber <= totalSessions) {
    const dayOfWeek = currentDate.getDay(); // 0-6

    // Kiểm tra ngày hiện tại có phải ngày học không
    if (daysOfWeek.includes(dayOfWeek)) {
      // Tìm topic từ curriculum của Course (nếu có)
      const curriculumItem = course.curriculum?.find(
        (item) => item.sessionNo === sessionNumber,
      );

      schedules.push({
        classId,
        teacherId: classDoc.teacherId,
        sessionNumber,
        date: new Date(currentDate), //Tạo bản sao! Không push reference
        startTime,
        endTime,
        room: classDoc.room,
        topic: curriculumItem?.topic || null,
        status: "scheduled",
      });

      sessionNumber++;
    }

    // Di chuyển đến ngày tiếp theo
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const createdSchedules = await Schedule.insertMany(schedules);

  return {
    totalCreated: createdSchedules.length,
    totalSessions,
    schedules: createdSchedules,
  };
};

export const deleteSchedulesByClass = async (classId) => {
  const result = await Schedule.deleteMany({
    classId,
    status: "scheduled", // Chỉ xóa buổi chưa diễn ra, giữ lại buổi đã completed/cancelled
  });

  return {
    deletedCount: result.deletedCount,
  };
};
