import Grade from "../models/Grade.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Enrollment from "../models/Enrollment.js";
import Parent from "../models/Parent.js";

// ==================== CREATE ====================
/**
 * @desc    Nhập điểm cho 1 bài kiểm tra của 1 học sinh
 * @route   POST /api/grades
 * @access  Private (Admin, Teacher)
 *
 * Body:
 * {
 *   "studentId": "<id>",
 *   "classId": "<id>",
 *   "assessmentType": "quiz",
 *   "title": "Quiz Unit 3",
 *   "score": 8,
 *   "maxScore": 10,
 *   "feedback": "Tốt, cần cải thiện phần nghe"
 * }
 */
export const createGrade = async (req, res, next) => {
  try {
    const {
      studentId,
      classId,
      assessmentType,
      title,
      score,
      maxScore,
      feedback,
    } = req.body;

    // --- Kiểm tra lớp học tồn tại ---
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }

    // --- Kiểm tra học sinh tồn tại ---
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error("Không tìm thấy học sinh");
    }

    // --- Kiểm tra HS có đang học lớp này không ---
    // Tương tự Attendance: chỉ chấm điểm cho HS thuộc lớp
    const enrollment = await Enrollment.findOne({
      studentId,
      classId,
      status: "active",
    });
    if (!enrollment) {
      res.status(400);
      throw new Error("Học sinh không thuộc lớp này hoặc đã rời lớp");
    }

    // --- Tìm Teacher record từ userId đang đăng nhập ---
    // Token chỉ có userId + role, nên cần query DB để lấy teacherId
    // (gradedBy ref đến Teacher, không phải User)
    const teacher = await Teacher.findOne({ userId: req.user.userId });
    if (!teacher) {
      res.status(403);
      throw new Error("Tài khoản này không phải giáo viên, không thể chấm điểm");
    }

    // --- Tạo bản ghi điểm ---
    const grade = await Grade.create({
      studentId,
      classId,
      assessmentType,
      title,
      score,
      maxScore,
      gradedBy: teacher._id, // Lấy _id của Teacher record từ DB
      feedback,
    });

    res.status(201).json({
      message: "Nhập điểm thành công",
      grade,
    });
  } catch (error) {
    // Xử lý lỗi duplicate từ compound index
    if (error.code === 11000) {
      res.status(409);
      error.message =
        "Học sinh đã có điểm cho bài kiểm tra này trong lớp. Hãy sử dụng chức năng sửa điểm.";
    }
    next(error);
  }
};

// ==================== READ ====================
/**
 * @desc    Lấy danh sách điểm (filter, phân trang)
 * @route   GET /api/grades?classId=...&studentId=...&assessmentType=...&page=1&limit=20
 * @access  Private (Admin, Teacher)
 */
export const getGrades = async (req, res, next) => {
  try {
    const {
      classId,
      studentId,
      assessmentType,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;
    if (assessmentType) filter.assessmentType = assessmentType;

    const skip = (page - 1) * limit;

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate({
          path: "studentId",
          select: "studentCode",
          populate: { path: "userId", select: "fullName" },
        })
        .populate("classId", "classCode")
        .populate({
          path: "gradedBy",
          select: "employeeCode",
          populate: { path: "userId", select: "fullName" },
        })
        .skip(skip)
        .limit(Number(limit))
        .sort({ gradedAt: -1 }), // Mới nhất trước

      Grade.countDocuments(filter),
    ]);

    res.status(200).json({
      grades,
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
 * @desc    Xem chi tiết 1 bản ghi điểm
 * @route   GET /api/grades/:id
 * @access  Private (Admin, Teacher)
 */
export const getGradeById = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate({
        path: "studentId",
        select: "studentCode dateOfBirth",
        populate: { path: "userId", select: "fullName email phone" },
      })
      .populate("classId", "classCode room")
      .populate({
        path: "gradedBy",
        select: "employeeCode specializations",
        populate: { path: "userId", select: "fullName" },
      });

    if (!grade) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi điểm");
    }

    res.status(200).json({ grade });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE ====================
/**
 * @desc    Sửa điểm / nhận xét
 * @route   PUT /api/grades/:id
 * @access  Private (Admin, Teacher)
 *
 * LƯU Ý: Khi sửa điểm, cần kiểm tra score mới <= maxScore
 * Validation đã xử lý ở tầng middleware (khi cả 2 trường đều được gửi).
 * Nhưng khi CHỈ gửi score (không gửi maxScore), ta cần kiểm tra
 * với maxScore hiện tại trong DB.
 */
export const updateGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi điểm");
    }

    // Kiểm tra score vs maxScore khi chỉ gửi 1 trong 2
    // (Validation middleware chỉ check khi gửi CẢ HAI)
    if (req.body.score !== undefined && req.body.maxScore === undefined) {
      if (req.body.score > grade.maxScore) {
        res.status(400);
        throw new Error(
          `Điểm (${req.body.score}) không được vượt quá điểm tối đa hiện tại (${grade.maxScore})`,
        );
      }
    }
    if (req.body.maxScore !== undefined && req.body.score === undefined) {
      if (grade.score > req.body.maxScore) {
        res.status(400);
        throw new Error(
          `Điểm tối đa mới (${req.body.maxScore}) không được nhỏ hơn điểm hiện tại (${grade.score})`,
        );
      }
    }

    // Tìm Teacher record từ userId (tương tự createGrade)
    const teacher = await Teacher.findOne({ userId: req.user.userId });
    if (!teacher) {
      res.status(403);
      throw new Error("Tài khoản này không phải giáo viên, không thể sửa điểm");
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        gradedBy: teacher._id, // Ghi lại người sửa
        gradedAt: new Date(), // Ghi lại thời gian sửa
      },
      { new: true, runValidators: true },
    )
      .populate({
        path: "studentId",
        select: "studentCode",
        populate: { path: "userId", select: "fullName" },
      })
      .populate("classId", "classCode");

    res.status(200).json({
      message: "Cập nhật điểm thành công",
      grade: updatedGrade,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE ====================
/**
 * @desc    Xóa 1 bản ghi điểm
 * @route   DELETE /api/grades/:id
 * @access  Private (Admin only)
 *
 * Khác với Attendance (không cho xóa), Grade CÓ THỂ xóa
 * vì giáo viên có thể nhập nhầm hoàn toàn (sai bài, sai HS).
 * Chỉ Admin mới được xóa để tránh giáo viên xóa nhầm.
 */
export const deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      res.status(404);
      throw new Error("Không tìm thấy bản ghi điểm");
    }

    await Grade.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Đã xóa bản ghi điểm",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CONVENIENCE ROUTES ====================
/**
 * @desc    Xem tất cả điểm của 1 học sinh trong 1 lớp
 * @route   GET /api/grades/student/:studentId/class/:classId
 * @access  Private (Admin, Teacher)
 *
 * Ứng dụng: Giáo viên mở hồ sơ 1 HS → xem toàn bộ điểm trong lớp
 */
export const getGradesByStudent = async (req, res, next) => {
  try {
    const { studentId, classId } = req.params;

    // Kiểm tra học sinh tồn tại
    const student = await Student.findById(studentId).populate(
      "userId",
      "fullName",
    );
    if (!student) {
      res.status(404);
      throw new Error("Không tìm thấy học sinh");
    }

    const grades = await Grade.find({ studentId, classId })
      .populate("classId", "classCode")
      .populate({
        path: "gradedBy",
        select: "employeeCode",
        populate: { path: "userId", select: "fullName" },
      })
      .sort({ assessmentType: 1, gradedAt: 1 }); // Nhóm theo loại bài, rồi theo thời gian

    // Tính điểm trung bình
    const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
    const totalMaxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);

    res.status(200).json({
      student: {
        _id: student._id,
        studentCode: student.studentCode,
        fullName: student.userId?.fullName,
      },
      summary: {
        totalAssessments: grades.length,
        totalScore,
        totalMaxScore,
        averagePercent:
          totalMaxScore > 0
            ? Math.round((totalScore / totalMaxScore) * 100 * 10) / 10
            : 0,
      },
      grades,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Xem bảng điểm của cả lớp cho 1 bài kiểm tra cụ thể
 * @route   GET /api/grades/class/:classId?assessmentType=quiz&title=Quiz Unit 3
 * @access  Private (Admin, Teacher)
 *
 * Ứng dụng: Giáo viên xem điểm "Quiz Unit 3" của TẤT CẢ HS trong lớp
 */
export const getGradesByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { assessmentType, title } = req.query;

    // Kiểm tra lớp tồn tại
    const classDoc = await Class.findById(classId).populate(
      "courseId",
      "code name",
    );
    if (!classDoc) {
      res.status(404);
      throw new Error("Không tìm thấy lớp học");
    }

    // Build filter
    const filter = { classId };
    if (assessmentType) filter.assessmentType = assessmentType;
    if (title) filter.title = title;

    const grades = await Grade.find(filter)
      .populate({
        path: "studentId",
        select: "studentCode",
        populate: { path: "userId", select: "fullName" },
      })
      .populate({
        path: "gradedBy",
        select: "employeeCode",
        populate: { path: "userId", select: "fullName" },
      })
      .sort({ "studentId.studentCode": 1 });

    // Tính thống kê lớp
    const scores = grades.map((g) => g.score);
    const maxScores = grades.map((g) => g.maxScore);

    res.status(200).json({
      classCode: classDoc.classCode,
      courseName: classDoc.courseId?.name,
      filter: {
        assessmentType: assessmentType || "all",
        title: title || "all",
      },
      summary: {
        totalStudents: grades.length,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        averageScore:
          scores.length > 0
            ? Math.round(
                (scores.reduce((a, b) => a + b, 0) / scores.length) * 10,
              ) / 10
            : 0,
      },
      grades,
    });
  } catch (error) {
    next(error);
  }
};
// ==================== STUDENT & PARENT GRADES ====================
/**
 * @desc    Student xem điểm của mình
 * @route   GET /api/grades/my-grades
 * @access  Private (Student only)
 */
export const getMyGrades = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      res.status(404);
      throw new Error("Không tìm thấy hồ sơ học sinh");
    }

    const grades = await Grade.find({ studentId: student._id })
      .populate({
        path: "classId",
        select: "classCode room",
        populate: { path: "courseId", select: "name" },
      })
      .sort({ gradedAt: -1 });

    res.status(200).json({
      totalGrades: grades.length,
      grades,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Parent xem điểm của con
 * @route   GET /api/grades/my-children
 * @access  Private (Parent only)
 */
export const getChildrenGrades = async (req, res, next) => {
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
      return res.status(200).json({
        message: "Chưa có học sinh nào được liên kết",
        children: [],
      });
    }

    const children = [];
    for (const student of parent.studentIds) {
      const grades = await Grade.find({ studentId: student._id })
        .populate({
          path: "classId",
          select: "classCode room",
          populate: { path: "courseId", select: "name" },
        })
        .sort({ gradedAt: -1 });

      children.push({
        student: {
          _id: student._id,
          studentCode: student.studentCode,
          fullName: student.userId?.fullName,
        },
        totalGrades: grades.length,
        grades,
      });
    }

    res.status(200).json({ children });
  } catch (error) {
    next(error);
  }
};
