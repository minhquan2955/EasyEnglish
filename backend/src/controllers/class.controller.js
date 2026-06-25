import Class from "../models/Class.js";
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";
import { checkScheduleConflict } from "../utils/scheduleHelper.js";

// ==================== CREATE ====================
/**
 * @desc    Admin tạo lớp học mới
 * @route   POST /api/classes
 * @access  Private (Admin only)
 *
 * KHÁI NIỆM MỚI: Kiểm tra Foreign Key thủ công
 *
 * Khác với SQL (MySQL, PostgreSQL...) có ràng buộc Foreign Key tự động,
 * MongoDB KHÔNG có tính năng này. Nghĩa là có thể lưu một courseId
 * không tồn tại mà MongoDB sẽ không báo lỗi!
 *
 * Phải TỰ KIỂM TRA bằng code:
 *   1. courseId có tồn tại trong bảng Course không?
 *   2. teacherId có tồn tại trong bảng Teacher không?
 */

export const createClass = async (req, res, next) => {
  try {
    const {
      classCode,
      courseId,
      teacherId,
      room,
      maxStudents,
      startDate,
      endDate,
      schedule,
    } = req.body;

    // --- Kiểm tra startDate và endDate ---
    if (new Date(startDate) > new Date(endDate)) {
      res.status(400);
      throw new Error("Ngày bắt đầu không thể sau ngày kết thúc");
    }

    // --- Kiểm tra classCode trùng ---
    const existingClass = await Class.findOne({ classCode });
    if (existingClass) {
      res.status(400);
      throw new Error("Mã lớp đã tồn tại");
    }
    // --- Kiểm tra Foreign Key: Course có tồn tại không? ---
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error("Không tìm thấy khóa học đã cung cấp");
    }
    // --- Kiểm tra Foreign Key: Teacher có tồn tại không? ---
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      res.status(404);
      throw new Error("Không tìm thấy giáo viên đã cung cấp");
    }
    // --- Kiểm tra xung đột lịch dạy và phòng học ---
    const conflictCheck = await checkScheduleConflict({
      teacherId,
      room,
      schedule,
      startDate,
      endDate,
    });
    if (conflictCheck.hasConflict) {
      res.status(409);
      throw new Error(conflictCheck.message);
    }
    const newClass = await Class.create({
      classCode,
      courseId,
      teacherId,
      room,
      maxStudents,
      startDate,
      endDate,
      schedule,
    });
    res.status(201).json({
      message: "Tạo lớp học thành công",
      class: newClass,
    });
  } catch (error) {
    next(error);
  }
};
// ==================== READ ====================
/**
 * @desc    Lấy danh sách lớp học (có filter và phân trang)
 * @route   GET /api/classes?courseId=...&teacherId=...&status=active&page=1&limit=10
 * @access  Private (Admin, Teacher)
 */
export const getClasses = async (req, res, next) => {
  try {
    const { courseId, teacherId, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;

    // Filter by logged in teacher
    if (req.user && req.user.role === "teacher") {
      const Teacher = (await import("../models/Teacher.js")).default;
      const teacherDoc = await Teacher.findOne({ userId: req.user.userId });
      
      if (!teacherDoc) {
        return res.status(200).json({ classes: [], total: 0 });
      }
      filter.teacherId = teacherDoc._id;
    }

    const skip = (page - 1) * limit;
    const [classes, total] = await Promise.all([
      Class.find(filter)
        //KHÁI NIỆM MỚI: populate()
        .populate("courseId", "code name category")
        .populate({
          path: "teacherId",
          select: "employeeCode",
          populate: {
            path: "userId",
            select: "fullName email",
          },
        })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Class.countDocuments(filter),
    ]);
    const Enrollment = (await import("../models/Enrollment.js")).default;
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Enrollment.countDocuments({
          classId: cls._id,
          status: "active",
        });
        return {
          ...cls.toObject(),
          studentCount,
        };
      })
    );

    res.status(200).json({
      classes: classesWithCount,
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
 * @desc    Xem chi tiết một lớp học
 * @route   GET /api/classes/:id
 * @access  Private (Admin, Teacher)
 */
export const getClassById = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate(
        "courseId",
        "code name category totalSessions sessionDurationMins tuitionFee",
      )
      .populate({
        path: "teacherId",
        select: "employeeCode specializations",
        populate: {
          path: "userId",
          select: "fullName email phone",
        },
      });
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }
    const Enrollment = (await import("../models/Enrollment.js")).default;
    const studentCount = await Enrollment.countDocuments({
      classId: classDoc._id,
      status: "active",
    });
    res.status(200).json({
      class: {
        ...classDoc.toObject(),
        studentCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
// ==================== UPDATE ====================
/**
 * @desc    Admin cập nhật thông tin lớp học
 * @route   PUT /api/classes/:id
 * @access  Private (Admin only)
 */
export const updateClass = async (req, res, next) => {
  try {
    // Nếu client gửi courseId hoặc teacherId mới, kiểm tra chúng có tồn tại không
    if (req.body.courseId) {
      const course = await Course.findById(req.body.courseId);
      if (!course) {
        res.status(404);
        throw new Error("Không tìm thấy khóa học với courseId đã cung cấp");
      }
    }
    if (req.body.teacherId) {
      const teacher = await Teacher.findById(req.body.teacherId);
      if (!teacher) {
        res.status(404);
        throw new Error("Không tìm thấy giáo viên với teacherId đã cung cấp");
      }
    }
    // --- Kiểm tra xung đột lịch dạy và phòng học khi cập nhật ---
    const currentClass = await Class.findById(req.params.id);
    if (!currentClass) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }

    const finalTeacherId = req.body.teacherId || currentClass.teacherId;
    const finalRoom = req.body.room || currentClass.room;
    const finalSchedule = req.body.schedule || currentClass.schedule;
    const finalStartDate = req.body.startDate || currentClass.startDate;
    const finalEndDate = req.body.endDate || currentClass.endDate;

    // --- Kiểm tra startDate và endDate ---
    if (new Date(finalStartDate) > new Date(finalEndDate)) {
      res.status(400);
      throw new Error("Ngày bắt đầu không thể sau ngày kết thúc");
    }

    const conflictCheck = await checkScheduleConflict({
      teacherId: finalTeacherId,
      room: finalRoom,
      schedule: finalSchedule,
      startDate: finalStartDate,
      endDate: finalEndDate,
      excludeClassId: req.params.id,
    });

    if (conflictCheck.hasConflict) {
      res.status(409);
      throw new Error(conflictCheck.message);
    }
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
      .populate("courseId", "code name category")
      .populate({
        path: "teacherId",
        select: "employeeCode",
        populate: {
          path: "userId",
          select: "fullName email",
        },
      });
    if (!updatedClass) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }
    const Enrollment = (await import("../models/Enrollment.js")).default;
    const studentCount = await Enrollment.countDocuments({
      classId: updatedClass._id,
      status: "active",
    });
    res.status(200).json({
      message: "Cập nhật lớp học thành công",
      class: {
        ...updatedClass.toObject(),
        studentCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
// ==================== DELETE (Soft Delete) ====================
/**
 * @desc    Admin đóng lớp học (soft delete → status "inactive")
 * @route   DELETE /api/classes/:id
 * @access  Private (Admin only)
 */
export const deleteClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }
    classDoc.status = "inactive";
    await classDoc.save();
    res.status(200).json({
      message: "Đã đóng lớp học",
      class: classDoc,
    });
  } catch (error) {
    next(error);
  }
};
