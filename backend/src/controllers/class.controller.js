import Class from "../models/Class.js";
import Course from "../models/Course.js";
import Teacher from "../models/Teacher.js";

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
    // --- Kiểm tra xung đột lịch dạy của giáo viên ---
    // Chỉ kiểm tra khi lớp mới có thông tin schedule
    if (schedule) {
      const conflictingClass = await Class.findOne({
        teacherId, // Cùng giáo viên
        status: "active", // Chỉ xét lớp đang hoạt động

        // Trùng ít nhất 1 ngày trong tuần
        // $in: kiểm tra mảng daysOfWeek mới có phần tử nào
        //      trùng với mảng daysOfWeek của lớp cũ không
        "schedule.daysOfWeek": { $in: schedule.daysOfWeek },

        // Trùng khung giờ (2 khoảng thời gian giao nhau)
        // Điều kiện: giờ bắt đầu lớp cũ < giờ kết thúc lớp mới
        //        VÀ giờ kết thúc lớp cũ > giờ bắt đầu lớp mới
        "schedule.startTime": { $lt: schedule.endTime },
        "schedule.endTime": { $gt: schedule.startTime },
      });

      if (conflictingClass) {
        res.status(409); // xảy ra confict
        throw new Error(
          `Giáo viên đã có lớp ${conflictingClass.classCode} trùng lịch dạy`,
        );
      }
    }
    // --- Kiểm tra xung đột phòng học ---
    // Chỉ kiểm tra khi có cả room VÀ schedule
    if (room && schedule) {
      const roomConflict = await Class.findOne({
        room, // Cùng phòng
        status: "active",
        "schedule.daysOfWeek": { $in: schedule.daysOfWeek },
        "schedule.startTime": { $lt: schedule.endTime },
        "schedule.endTime": { $gt: schedule.startTime },
      });
      if (roomConflict) {
        res.status(409);
        throw new Error(
          `Phòng ${room} đã được sử dụng bởi lớp ${roomConflict.classCode} trong khung giờ này`,
        );
      }
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
    const skip = (page - 1) * limit;
    const [classes, total] = await Promise.all([
      Class.find(filter)
        // ↓↓↓ KHÁI NIỆM MỚI: populate() ↓↓↓
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
    res.status(200).json({
      classes,
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
    res.status(200).json({ class: classDoc });
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
    // --- Kiểm tra xung đột lịch dạy khi thay đổi giáo viên hoặc lịch ---
    // Chỉ kiểm tra khi có thay đổi teacherId hoặc schedule
    if (req.body.teacherId || req.body.schedule) {
      // Lấy thông tin lớp hiện tại từ DB để biết teacher/schedule cũ
      const currentClass = await Class.findById(req.params.id);
      if (!currentClass) {
        res.status(404);
        throw new Error("Không tìm thấy lớp học");
      }

      // Xác định giá trị sẽ dùng sau khi cập nhật:
      // Nếu client gửi giá trị mới → dùng giá trị mới
      // Nếu không gửi → giữ nguyên giá trị cũ từ DB
      const finalTeacherId = req.body.teacherId || currentClass.teacherId;
      const finalSchedule = req.body.schedule || currentClass.schedule;

      // Chỉ kiểm tra nếu lớp có schedule
      if (finalSchedule && finalSchedule.daysOfWeek) {
        const conflictingClass = await Class.findOne({
          // Loại trừ chính lớp đang sửa (lớp không thể xung đột với chính nó!)
          _id: { $ne: req.params.id }, // $ne = "not equal" (không bằng)
          teacherId: finalTeacherId,
          status: "active",
          "schedule.daysOfWeek": { $in: finalSchedule.daysOfWeek },
          "schedule.startTime": { $lt: finalSchedule.endTime },
          "schedule.endTime": { $gt: finalSchedule.startTime },
        });

        if (conflictingClass) {
          res.status(409);
          throw new Error(
            `Giáo viên đã có lớp ${conflictingClass.classCode} trùng lịch dạy`,
          );
        }
      }
    }
    // --- Kiểm tra xung đột phòng học khi cập nhật ---
    if (req.body.room || req.body.schedule) {
      const currentClass = await Class.findById(req.params.id);
      // (nếu đã query currentClass ở trên thì có thể tái sử dụng, không cần query lại)
      const finalRoom = req.body.room || currentClass?.room;
      const finalSchedule = req.body.schedule || currentClass?.schedule;
      if (finalRoom && finalSchedule && finalSchedule.daysOfWeek) {
        const roomConflict = await Class.findOne({
          _id: { $ne: req.params.id }, // Loại trừ chính lớp đang sửa
          room: finalRoom,
          status: "active",
          "schedule.daysOfWeek": { $in: finalSchedule.daysOfWeek },
          "schedule.startTime": { $lt: finalSchedule.endTime },
          "schedule.endTime": { $gt: finalSchedule.startTime },
        });
        if (roomConflict) {
          res.status(409);
          throw new Error(
            `Phòng ${finalRoom} đã được sử dụng bởi lớp ${roomConflict.classCode} trong khung giờ này`,
          );
        }
      }
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
    res.status(200).json({
      message: "Cập nhật lớp học thành công",
      class: updatedClass,
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
