import Attendance from "../models/Attendance.js";
import Schedule from "../models/Schedule.js";
import Enrollment from "../models/Enrollment.js";
import { bulkCheckIn } from "../services/attendance.service.js";

// ==================== BULK CHECK-IN ====================
/**
 * @desc    Giáo viên điểm danh cả lớp cho 1 buổi học
 * @route   POST /api/attendances/bulk
 * @access  Private (Admin, Teacher)
 *
 * Body:
 * {
 *   "scheduleId": "<schedule_id>",
 *   "students": [
 *     { "studentId": "<id>", "status": "present" },
 *     { "studentId": "<id>", "status": "absent", "notes": "xin phép" }
 *   ]
 * }
 */
export const bulkCheckInController = async (req, res, next) => {
  try {
    const { scheduleId, students } = req.body;

    // req.user.userId được gắn bởi auth.middleware
    const checkedInBy = req.user.userId;

    // Gọi Service để xử lý logic phức tạp
    const result = await bulkCheckIn({ scheduleId, students, checkedInBy });

    res.status(200).json({
      message: `Điểm danh thành công: ${result.totalProcessed} học sinh`,
      ...result,
    });
  } catch (error) {
    if (error.message.includes("Không tìm thấy")) {
      res.status(404);
    } else if (error.message.includes("không thuộc lớp")) {
      res.status(400);
    } else if (error.message.includes("đã bị hủy")) {
      res.status(400);
    }
    next(error);
  }
};

// ==================== READ ====================
/**
 * @desc    Lấy danh sách điểm danh của 1 buổi học
 * @route   GET /api/attendances/schedule/:scheduleId
 * @access  Private (Admin, Teacher)
 *
 * Đây là convenience route — giáo viên mở 1 buổi học ra và xem ai có mặt, ai vắng
 */
export const getAttendanceBySchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;

    // Kiểm tra buổi học tồn tại
    const schedule = await Schedule.findById(scheduleId).populate(
      "classId",
      "classCode",
    );
    if (!schedule) {
      res.status(404);
      throw new Error("Không tìm thấy buổi học");
    }

    const attendances = await Attendance.find({ scheduleId })
      .populate({
        path: "studentId",
        select: "studentCode",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("checkedInBy", "fullName")
      .sort({ "studentId.studentCode": 1 });

    // Đếm present/absent
    const presentCount = attendances.filter(
      (a) => a.status === "present",
    ).length;
    const absentCount = attendances.filter((a) => a.status === "absent").length;

    res.status(200).json({
      schedule: {
        _id: schedule._id,
        sessionNumber: schedule.sessionNumber,
        date: schedule.date,
        classCode: schedule.classId?.classCode,
      },
      summary: {
        total: attendances.length,
        present: presentCount,
        absent: absentCount,
      },
      attendances,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách điểm danh (filter, phân trang)
 * @route   GET /api/attendances?classId=...&studentId=...&scheduleId=...&status=...&page=1&limit=20
 * @access  Private (Admin, Teacher)
 */
export const getAttendances = async (req, res, next) => {
  try {
    const {
      classId,
      studentId,
      scheduleId,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (scheduleId) filter.scheduleId = scheduleId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      Attendance.find(filter)
        .populate({
          path: "studentId",
          select: "studentCode",
          populate: { path: "userId", select: "fullName" },
        })
        .populate("scheduleId", "sessionNumber date startTime endTime")
        .populate("classId", "classCode")
        .populate("checkedInBy", "fullName")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      Attendance.countDocuments(filter),
    ]);

    res.status(200).json({
      attendances,
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
 * @desc    Xem chi tiết 1 bản ghi điểm danh
 * @route   GET /api/attendances/:id
 * @access  Private (Admin, Teacher)
 */
export const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: "studentId",
        select: "studentCode dateOfBirth",
        populate: { path: "userId", select: "fullName email phone" },
      })
      .populate("scheduleId", "sessionNumber date startTime endTime room topic")
      .populate("classId", "classCode room")
      .populate("checkedInBy", "fullName");

    if (!attendance) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi điểm danh");
    }

    res.status(200).json({ attendance });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE ====================
/**
 * @desc    Sửa trạng thái điểm danh
 * @route   PUT /api/attendances/:id
 * @access  Private (Admin, Teacher)
 */
export const updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi điểm danh");
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        checkedInBy: req.user.userId, // Ghi lại người sửa
        checkedInAt: new Date(), // Ghi lại thời gian sửa
      },
      { new: true, runValidators: true },
    )
      .populate({
        path: "studentId",
        select: "studentCode",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("scheduleId", "sessionNumber date");

    res.status(200).json({
      message: "Cập nhật điểm danh thành công",
      attendance: updatedAttendance,
    });
  } catch (error) {
    next(error);
  }
};
