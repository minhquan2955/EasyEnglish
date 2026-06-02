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

  // Lấy dữ liệu ngày ban đầu
  let currentDate = new Date(classDoc.startDate);
  const originEndDate = new Date(classDoc.endDate);

  // Chuẩn hóa về UTC 00:00:00 để tránh sai lệch do Timezone/DST của Server
  currentDate = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
    ),
  );
  const endDate = new Date(
    Date.UTC(
      originEndDate.getUTCFullYear(),
      originEndDate.getUTCMonth(),
      originEndDate.getUTCDate(),
    ),
  );

  let iterations = 0;
  const MAX_ITERATIONS = 730; // Chặn tối đa vòng lặp 2 năm: thời lượng khóa học ko quá 2 năm

  while (currentDate <= endDate && sessionNumber <= totalSessions) {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      throw new Error(
        `Thuật toán sinh lịch bị quá tải (vượt quá ${MAX_ITERATIONS} ngày). Vui lòng kiểm tra lại cấu hình ngày tháng.`,
      );
    }

    const dayOfWeek = currentDate.getUTCDay(); // Sử dụng getUTCDay (0-6)

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
        date: new Date(currentDate), // Tạo bản sao ngày UTC chuẩn
        startTime,
        endTime,
        room: classDoc.room,
        topic: curriculumItem?.topic || null,
        status: "scheduled",
      });

      sessionNumber++;
    }

    // Di chuyển đến ngày tiếp theo an toàn trên hệ UTC
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // --- Áp dụng Cách A: Kiểm tra xem đã sinh đủ buổi học chưa ---
  if (sessionNumber <= totalSessions) {
    throw new Error(
      `Khoảng thời gian từ ngày bắt đầu đến ngày kết thúc quá ngắn. Chỉ xếp được ${sessionNumber - 1}/${totalSessions} buổi học.`,
    );
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

export const autoCompleteExpiredSchedules = async () => {
  try {
    // Tính toán mốc "Hôm nay ở GMT+7" độc lập với múi giờ của Server
    const now = new Date();
    const gmt7Time = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    // Mốc "đầu ngày hôm nay" chuẩn UTC (khớp với kiểu lưu trữ của DB)
    const todayStart = new Date(
      Date.UTC(
        gmt7Time.getUTCFullYear(),
        gmt7Time.getUTCMonth(),
        gmt7Time.getUTCDate(),
      ),
    );

    // Lấy giờ:phút hiện tại ở GMT+7
    const currentHour = String(gmt7Time.getUTCHours()).padStart(2, "0");
    const currentMinute = String(gmt7Time.getUTCMinutes()).padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;

    // Cập nhật tất cả buổi học đã hết giờ
    // $or: thỏa MÃN 1 TRONG 2 điều kiện
    //   Điều kiện 1: date < todayStart => ngày học đã qua
    //   Điều kiện 2: date = todayStart VÀ endTime <= currentTime → hôm nay nhưng đã hết giờ
    const result = await Schedule.updateMany(
      {
        status: "scheduled",
        $or: [
          // Trường hợp 1: Buổi học ở ngày đã qua
          { date: { $lt: todayStart } },
          // Trường hợp 2: Buổi học hôm nay nhưng đã hết giờ
          {
            date: {
              $gte: todayStart,
              $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
            },
            endTime: { $lte: currentTime },
          },
        ],
      },
      { $set: { status: "completed" } },
    );

    // Chỉ log khi thực sự có cập nhật
    if (result.modifiedCount > 0) {
      console.log(
        `[Auto-Complete] Đã cập nhật ${result.modifiedCount} buổi học sang "completed" lúc ${now.toLocaleString("vi-VN")}`,
      );
    }
  } catch (error) {
    console.error("[Auto-Complete] Lỗi:", error.message);
  }
};
