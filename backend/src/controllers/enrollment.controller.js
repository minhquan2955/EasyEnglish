import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import Parent from "../models/Parent.js";
// ==================== CREATE ====================
/**
 * @desc    Admin ghi danh học sinh vào lớp
 * @route   POST /api/enrollments
 * @access  Private (Admin only)
 *
 * BUSINESS LOGIC cần kiểm tra:
 *   1. studentId có tồn tại không?
 *   2. classId có tồn tại không?
 *   3. Lớp có còn chỗ trống không? (so sánh sĩ số hiện tại vs maxStudents)
 *   4. Học sinh đã ghi danh vào lớp này chưa? (compound index sẽ bắt, nhưng ta xử lý lỗi đẹp hơn)
 *   5. Lớp có đang hoạt động không? (status = "active")
 */
export const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, classId, enrollDate, notes } = req.body;
    // --- 1. Kiểm tra Student có tồn tại không ---
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error("Không tìm thấy học sinh");
    }
    // --- 2. Kiểm tra Class có tồn tại không ---
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }
    // --- 3. Kiểm tra lớp có đang hoạt động không ---
    if (classDoc.status !== "active") {
      res.status(400);
      throw new Error("Lớp học không còn hoạt động, không thể ghi danh");
    }
    // --- 4. Kiểm tra học sinh đã ghi danh vào lớp chưa ---
    // Kiểm tra trùng lặp bằng code (ngoài compound index) trả về lỗi tốt hơn
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      classId,
      status: { $in: ["active", "completed"] }, // Chỉ kiểm tra trạng thái "đang học" hoặc "đã hoàn thành"
    });
    if (existingEnrollment) {
      res.status(409);
      throw new Error("Học sinh đã được ghi danh vào lớp này rồi");
    }
    // --- 5. Kiểm tra sĩ số lớp còn chỗ trống không ---
    // Đếm số lượng enrollment "active" trong lớp này
    // Nếu >= maxStudents → lớp đã đầy
    const currentStudentCount = await Enrollment.countDocuments({
      classId,
      status: "active",
    });
    if (currentStudentCount >= classDoc.maxStudents) {
      res.status(400);
      throw new Error(
        `Lớp đã đạt sĩ số tối đa (${classDoc.maxStudents} học sinh)`,
      );
    }
    // --- 6. Tạo hoặc Khôi phục enrollment ---
    // Sử dụng findOneAndUpdate để xử lý trường hợp HS đã từng ghi danh nhưng bị Xóa (status: dropped)
    // Nếu dùng .create(), sẽ bị lỗi Duplicate Key vì có index {studentId, classId}
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId, classId },
      {
        $set: {
          enrollDate,
          notes,
          status: "active" // Cập nhật lại status thành active
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Populate để trả về thông tin đầy đủ
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate({
        path: "studentId",
        select: "studentCode",
        populate: { path: "userId", select: "fullName email" },
      })
      .populate("classId", "classCode room");
    res.status(201).json({
      message: "Ghi danh học sinh thành công",
      enrollment: populatedEnrollment,
    });
  } catch (error) {
    next(error);
  }
};
// ==================== READ ====================
/**
 * @desc    Lấy danh sách ghi danh (có filter và phân trang)
 * @route   GET /api/enrollments?classId=...&studentId=...&status=active&page=1&limit=10
 * @access  Private (Admin, Teacher)
 * Nested populate
 * Enrollment chứa studentId → Student chứa userId → User có fullName
 * Cần populate "2 tầng" để lấy được tên học sinh
 */
export const getEnrollments = async (req, res, next) => {
  try {
    const { classId, studentId, status, page = 1, limit = 10 } = req.query;
    // Xây dựng filter object từ query params
    const filter = {};
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        // Populate "2 tầng": Enrollment → Student → User
        .populate({
          path: "studentId",
          select: "studentCode dateOfBirth",
          populate: {
            path: "userId",
            select: "fullName email phone",
          },
        })
        // Populate lớp học
        .populate("classId", "classCode room schedule")
        .skip(skip)
        .limit(Number(limit))
        .sort({ enrollDate: -1 }),
      Enrollment.countDocuments(filter),
    ]);
    res.status(200).json({
      enrollments,
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
 * @desc    Xem chi tiết một enrollment
 * @route   GET /api/enrollments/:id
 * @access  Private (Admin, Teacher)
 */
export const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: "studentId",
        select: "studentCode dateOfBirth gender",
        populate: {
          path: "userId",
          select: "fullName email phone",
        },
      })
      .populate({
        path: "classId",
        select: "classCode room schedule maxStudents status",
        populate: {
          path: "courseId",
          select: "code name",
        },
      });
    if (!enrollment) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi ghi danh");
    }
    res.status(200).json({ enrollment });
  } catch (error) {
    next(error);
  }
};
// ==================== UPDATE ====================
/**
 * @desc    Cập nhật trạng thái ghi danh (ví dụ: "dropped", "completed")
 * @route   PUT /api/enrollments/:id
 * @access  Private (Admin only)
 *
 * Chỉ cho phép cập nhật: status, notes, finalGrade
 * KHÔNG cho phép thay đổi studentId, classId
 */
export const updateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi ghi danh");
    }
    // Chỉ cập nhật các trường được phép (đã được filter bởi validation schema)
    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    )
      .populate({
        path: "studentId",
        select: "studentCode",
        populate: { path: "userId", select: "fullName email" },
      })
      .populate("classId", "classCode room");
    res.status(200).json({
      message: "Cập nhật ghi danh thành công",
      enrollment: updatedEnrollment,
    });
  } catch (error) {
    next(error);
  }
};
// ==================== DELETE (Soft Delete) ====================
/**
 * @desc    Hủy ghi danh (chuyển status => "dropped")
 * @route   DELETE /api/enrollments/:id
 * @access  Private (Admin only)
 *
 * KHÔNG xóa thật bản ghi khỏi database
 * mà chỉ chuyển trạng thái sang "dropped".
 */
export const deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi ghi danh");
    }
    if (enrollment.status === "dropped") {
      res.status(400);
      throw new Error("Ghi danh này đã được hủy trước đó");
    }
    enrollment.status = "dropped";
    await enrollment.save();
    res.status(200).json({
      message: "Đã hủy ghi danh",
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};
// ==================== Danh sách học sinh trong lớp ====================
/**
 * @desc    Lấy danh sách học sinh của một lớp cụ thể
 * @route   GET /api/enrollments/class/:classId/students
 * @access  Private (Admin, Teacher)
 *
 * Route params kết hợp filter
 *
 * Đây là một "convenience route" — thay vì client phải gọi
 * GET /api/enrollments?classId=xxx&status=active
 * ta tạo một route riêng chuyên lấy danh sách học sinh:
 * GET /api/enrollments/class/xxx/students
 */
export const getStudentsByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    // Kiểm tra lớp có tồn tại không
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }
    const enrollments = await Enrollment.find({
      classId,
      status: "active", // Chỉ lấy học sinh đang hoạt động
    })
      .populate({
        path: "studentId",
        select: "studentCode dateOfBirth gender",
        populate: {
          path: "userId",
          select: "fullName email phone",
        },
      })
      .sort({ enrollDate: 1 }); // Sắp xếp theo ngày ghi danh (cũ => mới)
    res.status(200).json({
      classCode: classDoc.classCode,
      maxStudents: classDoc.maxStudents,
      currentCount: enrollments.length,
      students: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PARENT ROUTES ====================
/**
 * @desc    Lấy danh sách các lớp con đang học (cho phụ huynh)
 * @route   GET /api/enrollments/my-children
 * @access  Private (Parent only)
 */
export const getChildrenEnrollments = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ userId: req.user.userId }).populate({
      path: "studentIds",
      select: "studentCode",
      populate: { path: "userId", select: "fullName" },
    });

    if (!parent) {
      res.status(404);
      throw new Error("Không tìm thấy hồ sơ phụ huynh");
    }

    if (!parent.studentIds || parent.studentIds.length === 0) {
      return res.status(200).json({ children: [] });
    }

    const children = [];
    for (const student of parent.studentIds) {
      const enrollments = await Enrollment.find({
        studentId: student._id,
        status: "active",
      }).populate({
        path: "classId",
        populate: [
          { path: "courseId", select: "name code description tuitionFee" },
          { path: "teacherId", populate: { path: "userId", select: "fullName" } }
        ]
      });

      children.push({
        student: {
          _id: student._id,
          studentCode: student.studentCode,
          fullName: student.userId?.fullName,
        },
        enrollments,
      });
    }

    res.status(200).json({ children });
  } catch (error) {
    next(error);
  }
};
