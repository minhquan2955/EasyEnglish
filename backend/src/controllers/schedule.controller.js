import Schedule from "../models/Schedule.js";
import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";
import {
  generateScheduleForClass,
  deleteSchedulesByClass,
} from "../services/schedule.service.js";

// ==================== GENERATE (Tính năng đặc biệt) ====================
/**
 * @desc    Sinh tự động tất cả buổi học cho một lớp
 * @route   POST /api/schedules/generate
 * @access  Private (Admin only)
 *
 * LUỒNG HOẠT ĐỘNG:
 *   1. Admin tạo Class (có startDate, endDate, schedule.daysOfWeek)
 *   2. Admin gọi API này, truyền classId
 *   3. Service sẽ tính toán và tạo ra tất cả buổi học cụ thể
 *
 * Đây là ví dụ về việc Controller gọi Service:
 *   - Controller: nhận request, xử lý lỗi, trả response
 *   - Service: chứa business logic phức tạp (thuật toán sinh ngày)
 */
export const generateSchedule = async (req, res, next) => {
  try {
    const { classId } = req.body;

    // Gọi Service để thực hiện logic phức tạp
    const result = await generateScheduleForClass(classId);

    res.status(201).json({
      message: `Đã sinh ${result.totalCreated}/${result.totalSessions} buổi học thành công`,
      ...result,
    });
  } catch (error) {
    // Service throw Error => Controller bắt lại và đặt status code phù hợp
    if (error.message.includes("Không tìm thấy")) {
      res.status(404);
    } else if (error.message.includes("đã có")) {
      res.status(409);
    } else if (error.message.includes("chưa có")) {
      res.status(400);
    }
    next(error);
  }
};

// ==================== CREATE (Tạo buổi học thủ công) ====================
/**
 * @desc    Tạo một buổi học riêng lẻ (buổi bù, buổi đặc biệt)
 * @route   POST /api/schedules
 * @access  Private (Admin only)
 */
export const createSchedule = async (req, res, next) => {
  try {
    const {
      classId,
      teacherId,
      sessionNumber,
      date,
      startTime,
      endTime,
      room,
      topic,
      notes,
      status,
    } = req.body;

    // Kiểm tra Class tồn tại
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }

    // Kiểm tra Teacher tồn tại
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404);
      throw new Error("Không tìm thấy giáo viên");
    }

    // Kiểm tra trùng lịch giáo viên trong cùng ngày + giờ
    const teacherConflict = await Schedule.findOne({
      teacherId,
      date,
      status: { $in: ["scheduled", "makeup"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    if (teacherConflict) {
      res.status(409);
      throw new Error(
        `Giáo viên đã có buổi dạy khác vào ngày và giờ này (buổi ${teacherConflict.sessionNumber} của lớp khác)`,
      );
    }

    const schedule = await Schedule.create({
      classId,
      teacherId,
      sessionNumber,
      date,
      startTime,
      endTime,
      room,
      topic,
      notes,
      status: status || "scheduled",
    });

    res.status(201).json({
      message: "Tạo buổi học thành công",
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== READ ====================
/**
 * @desc    Lấy danh sách buổi học (có filter và phân trang)
 * @route   GET /api/schedules?classId=...&teacherId=...&status=...&from=...&to=...&page=1&limit=20
 * @access  Private (Admin, Teacher)
 *
 * KHÁI NIỆM MỚI: Date Range Filter (lọc theo khoảng ngày)
 *
 * Khác với Enrollment chỉ filter theo ID,
 * Schedule cần filter theo khoảng thời gian:
 *   ?from=2026-06-01&to=2026-06-30  => lấy tất cả buổi học trong tháng 6
 *
 * MongoDB operators:
 *   $gte = "greater than or equal" (>=)
 *   $lte = "less than or equal" (<=)
 */
export const getSchedules = async (req, res, next) => {
  try {
    const {
      classId,
      teacherId,
      status,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;

    // Date range filter
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from); // Từ ngày...
      if (to) filter.date.$lte = new Date(to); // ...đến ngày
    }

    const skip = (page - 1) * limit;

    const [schedules, total] = await Promise.all([
      Schedule.find(filter)
        .populate({
          path: "classId",
          select: "classCode room",
          populate: {
            path: "courseId",
            select: "code name",
          },
        })
        .populate({
          path: "teacherId",
          select: "employeeCode",
          populate: {
            path: "userId",
            select: "fullName",
          },
        })
        .skip(skip)
        .limit(Number(limit))
        .sort({ date: 1, startTime: 1 }), // Sắp xếp theo ngày + giờ

      Schedule.countDocuments(filter),
    ]);

    res.status(200).json({
      schedules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xem chi tiết một buổi học
 * @route   GET /api/schedules/:id
 * @access  Private (Admin, Teacher)
 */
export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate({
        path: "classId",
        select: "classCode room maxStudents",
        populate: {
          path: "courseId",
          select: "code name",
        },
      })
      .populate({
        path: "teacherId",
        select: "employeeCode specializations",
        populate: {
          path: "userId",
          select: "fullName email phone",
        },
      });

    if (!schedule) {
      res.status(404);
      throw new Error("Không tìm thấy buổi học");
    }

    res.status(200).json({ schedule });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE ====================
/**
 * @desc    Cập nhật thông tin buổi học
 * @route   PUT /api/schedules/:id
 * @access  Private (Admin only)
 *
 * Dùng khi:
 *   - Đổi phòng học
 *   - Đổi giáo viên dạy thay (teacherId)
 *   - Đổi giờ học
 *   - Đánh dấu buổi học đã hoàn thành (status = "completed")
 *   - Hủy buổi học (status = "cancelled")
 */
export const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      res.status(404);
      throw new Error("Không tìm thấy buổi học");
    }

    // Nếu đổi giáo viên, kiểm tra GV mới tồn tại
    if (req.body.teacherId) {
      const teacher = await Teacher.findById(req.body.teacherId);
      if (!teacher) {
        res.status(404);
        throw new Error("Không tìm thấy giáo viên");
      }
    }

    // Kiểm tra trùng lịch GV nếu đổi GV hoặc đổi ngày/giờ
    if (
      req.body.teacherId ||
      req.body.date ||
      req.body.startTime ||
      req.body.endTime
    ) {
      const finalTeacherId = req.body.teacherId || schedule.teacherId;
      const finalDate = req.body.date || schedule.date;
      const finalStartTime = req.body.startTime || schedule.startTime;
      const finalEndTime = req.body.endTime || schedule.endTime;

      const conflict = await Schedule.findOne({
        _id: { $ne: req.params.id }, // Loại trừ chính nó
        teacherId: finalTeacherId,
        date: finalDate,
        status: { $in: ["scheduled", "makeup"] },
        startTime: { $lt: finalEndTime },
        endTime: { $gt: finalStartTime },
      });

      if (conflict) {
        res.status(409);
        throw new Error("Giáo viên đã có buổi dạy khác trùng lịch");
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
      .populate({
        path: "classId",
        select: "classCode room",
      })
      .populate({
        path: "teacherId",
        select: "employeeCode",
        populate: { path: "userId", select: "fullName" },
      });

    res.status(200).json({
      message: "Cập nhật buổi học thành công",
      schedule: updatedSchedule,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE ====================
/**
 * @desc    Hủy buổi học (soft delete => status "cancelled")
 * @route   DELETE /api/schedules/:id
 * @access  Private (Admin only)
 */
export const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      res.status(404);
      throw new Error("Không tìm thấy buổi học");
    }

    if (schedule.status === "cancelled") {
      res.status(400);
      throw new Error("Buổi học này đã được hủy trước đó");
    }

    schedule.status = "cancelled";
    await schedule.save();

    res.status(200).json({
      message: "Đã hủy buổi học",
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CONVENIENCE ROUTES ====================
/**
 * @desc    Lấy lịch dạy của một giáo viên (trong khoảng thời gian)
 * @route   GET /api/schedules/teacher/:teacherId?from=...&to=...
 * @access  Private (Admin, Teacher)
 *
 * Ứng dụng: Hiển thị "Thời khóa biểu tuần" cho giáo viên
 */
export const getSchedulesByTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { from, to } = req.query;

    // Kiểm tra giáo viên tồn tại
    const teacher = await Teacher.findById(teacherId).populate(
      "userId",
      "fullName",
    );
    if (!teacher) {
      res.status(404);
      throw new Error("Không tìm thấy giáo viên");
    }

    const filter = {
      teacherId,
      status: { $in: ["scheduled", "makeup"] },
    };

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const schedules = await Schedule.find(filter)
      .populate({
        path: "classId",
        select: "classCode room",
        populate: { path: "courseId", select: "code name" },
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      teacher: {
        _id: teacher._id,
        employeeCode: teacher.employeeCode,
        fullName: teacher.userId?.fullName,
      },
      totalSessions: schedules.length,
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy lịch học của một lớp
 * @route   GET /api/schedules/class/:classId
 * @access  Private (Admin, Teacher)
 *
 * Ứng dụng: Hiển thị tất cả buổi học của lớp, kèm tiến độ
 */
export const getSchedulesByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const classDoc = await Class.findById(classId).populate(
      "courseId",
      "code name totalSessions",
    );
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }

    const schedules = await Schedule.find({ classId })
      .populate({
        path: "teacherId",
        select: "employeeCode",
        populate: { path: "userId", select: "fullName" },
      })
      .sort({ sessionNumber: 1 });

    // Tính tiến độ
    const completedCount = schedules.filter(
      (s) => s.status === "completed",
    ).length;

    res.status(200).json({
      classCode: classDoc.classCode,
      courseName: classDoc.courseId?.name,
      totalSessions: classDoc.courseId?.totalSessions,
      completedSessions: completedCount,
      progressPercent: classDoc.courseId?.totalSessions
        ? Math.round((completedCount / classDoc.courseId.totalSessions) * 100)
        : 0,
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xóa tất cả buổi học "scheduled" của một lớp (để sinh lại)
 * @route   DELETE /api/schedules/class/:classId
 * @access  Private (Admin only)
 */
export const deleteSchedulesByClassId = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }

    const result = await deleteSchedulesByClass(classId);

    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} buổi học chưa diễn ra`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
