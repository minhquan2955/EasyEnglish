import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";

// ==================== QUERY ====================

/**
 * @desc    Admin xem danh sách người dùng (có filter và phân trang)
 * @route   GET /api/admin/users?role=teacher&status=active&page=1&limit=10
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    // Xây dựng bộ lọc động
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
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
 * @desc    Admin xem chi tiết một user (bao gồm profile mở rộng)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy người dùng");
    }

    // Tìm profile mở rộng dựa theo role
    let profile = null;
    if (user.role === "teacher") {
      profile = await Teacher.findOne({ userId: user._id });
    } else if (user.role === "student") {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === "parent") {
      profile = await Parent.findOne({ userId: user._id });
    }

    res.status(200).json({ user, profile });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE ====================

/**
 * @desc    Admin tạo tài khoản giáo viên (User + Teacher profile)
 * @route   POST /api/admin/teachers
 * @access  Private (Admin only)
 */
export const createTeacher = async (req, res, next) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      employeeCode,
      specializations,
      certifications,
      weeklySessionLimit,
      salary,
    } = req.body;

    // 1. Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã được sử dụng");
    }

    // 2. Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Tạo User
    const user = await User.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: "teacher",
    });

    // 4. Tạo Teacher profile liên kết với User
    const teacher = await Teacher.create({
      userId: user._id,
      employeeCode,
      specializations,
      certifications,
      weeklySessionLimit,
      salary,
    });

    res.status(201).json({
      message: "Tạo giáo viên thành công",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile: teacher,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin tạo tài khoản học sinh (User + Student profile)
 * @route   POST /api/admin/students
 * @access  Private (Admin only)
 */
export const createStudent = async (req, res, next) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      studentCode,
      dateOfBirth,
      gender,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã được sử dụng");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: "student",
    });

    const student = await Student.create({
      userId: user._id,
      studentCode,
      dateOfBirth,
      gender,
    });

    res.status(201).json({
      message: "Tạo học sinh thành công",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin tạo tài khoản phụ huynh và liên kết với học sinh
 * @route   POST /api/admin/parents
 * @access  Private (Admin only)
 */
export const createParent = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, studentIds, relationship } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã được sử dụng");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: "parent",
    });

    const parent = await Parent.create({
      userId: user._id,
      studentIds: studentIds || [],
      relationship,
    });

    // Nếu có studentIds, cập nhật parentIds trong các Student tương ứng
    if (studentIds && studentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { $addToSet: { parentIds: user._id } },
      );
    }

    res.status(201).json({
      message: "Tạo phụ huynh thành công",
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      profile: parent,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE ====================

/**
 * @desc    Admin cập nhật trạng thái tài khoản (active / inactive)
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).select("-passwordHash");

    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy người dùng");
    }

    res.status(200).json({
      message: `Đã ${status === "active" ? "kích hoạt" : "khóa"} tài khoản`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin liên kết phụ huynh với học sinh
 * @route   POST /api/admin/students/:id/link-parent
 * @access  Private (Admin only)
 */
export const linkParent = async (req, res, next) => {
  try {
    const { parentId } = req.body;
    const studentId = req.params.id;

    // Kiểm tra student tồn tại
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error("Không tìm thấy học sinh");
    }

    // Kiểm tra parent tồn tại
    const parent = await Parent.findOne({ userId: parentId });
    if (!parent) {
      res.status(404);
      throw new Error("Không tìm thấy phụ huynh");
    }

    // Thêm liên kết 2 chiều (tránh trùng lặp bằng $addToSet)
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: { parentIds: parentId },
    });

    await Parent.findOneAndUpdate(
      { userId: parentId },
      { $addToSet: { studentIds: studentId } },
    );

    res
      .status(200)
      .json({ message: "Liên kết phụ huynh - học sinh thành công" });
  } catch (error) {
    next(error);
  }
};
