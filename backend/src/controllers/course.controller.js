import Course from "../models/Course.js";

// ==================== CREATE ====================

/**
 * @desc    Admin tạo khóa học mới
 * @route   POST /api/courses
 * @access  Private (Admin only)
 */
export const createCourse = async (req, res, next) => {
  try {
    // req.body đã được validate bởi middleware validate(createCourseSchema)
    // và đã được Zod lọc sạch (chỉ giữ lại các trường có trong schema)
    const {
      code,
      name,
      category,
      totalSessions,
      sessionDurationMins,
      tuitionFee,
      curriculum,
    } = req.body;

    // Kiểm tra mã khóa học đã tồn tại chưa (vì code là unique trong Model)
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      res.status(400);
      throw new Error("Mã khóa học đã tồn tại");
    }

    const course = await Course.create({
      code,
      name,
      category,
      totalSessions,
      sessionDurationMins,
      tuitionFee,
      curriculum: curriculum || [], // Nếu không gửi curriculum thì để mảng rỗng
    });

    res.status(201).json({
      message: "Tạo khóa học thành công",
      course,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== READ ====================

/**
 * @desc    Lấy danh sách khóa học (có filter và phân trang)
 * @route   GET /api/courses?category=ielts&status=active&page=1&limit=10
 * @access  Private (Admin, Teacher)
 *
 * Query parameters giải thích:
 *   - category: lọc theo danh mục (ielts, nursery, kids, teens)
 *   - status:   lọc theo trạng thái (active, inactive)
 *   - page:     trang hiện tại (mặc định = 1)
 *   - limit:    số kết quả mỗi trang (mặc định = 10)
 */
export const getCourses = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;

    // Xây dựng bộ lọc động (chỉ thêm field nếu client gửi lên)
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Promise.all chạy song song 2 query để tăng tốc
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }), // Mới nhất lên trước
      Course.countDocuments(filter), // Đếm tổng số kết quả (để tính totalPages)
    ]);

    res.status(200).json({
      courses,
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
 * @desc    Xem chi tiết một khóa học
 * @route   GET /api/courses/:id
 * @access  Private (Admin, Teacher)
 */
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error("Không tìm thấy khóa học");
    }

    res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE ====================

/**
 * @desc    Admin cập nhật thông tin khóa học
 * @route   PUT /api/courses/:id
 * @access  Private (Admin only)
 *
 * Giải thích findByIdAndUpdate options:
 *   - { new: true }           trả về document SAU KHI cập nhật (mặc định trả về bản cũ)
 *   - { runValidators: true }  chạy lại validation của Mongoose Schema khi update
 */
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id, // ID từ URL parameter
      req.body, // Dữ liệu cập nhật (đã qua Zod validate)
      { new: true, runValidators: true },
    );

    if (!course) {
      res.status(404);
      throw new Error("Không tìm thấy khóa học");
    }

    res.status(200).json({
      message: "Cập nhật khóa học thành công",
      course,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE (Soft Delete) ====================

/**
 * @desc    Admin xóa khóa học (soft delete — chuyển status thành "inactive")
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin only)
 *
 * Không xóa thật (hard delete) khỏi database
 * Lý do: Các lớp học (Class) đang tham chiếu đến khóa học này, xóa thật sẽ gây lỗi dữ liệu hàng loạt.
 * Chỉ chuyển status từ "active" sang "inactive" để ẩn khỏi danh sách.
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error("Không tìm thấy khóa học");
    }

    // Soft delete: chỉ đổi status, không xóa document
    course.status = "inactive";
    await course.save();

    res.status(200).json({
      message: "Đã ngừng hoạt động khóa học",
      course,
    });
  } catch (error) {
    next(error);
  }
};
