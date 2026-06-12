import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.js";

/**
 * @desc    Admin tạo học sinh mới (tạo cả User và Student profile)
 * @route   POST /api/admin/students
 * @access  Private (Admin only)
 */
export const createStudent = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, password,
      studentCode, dateOfBirth, gender, parentIds, emergencyContact
    } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã được sử dụng");
    }

    // Check if studentCode exists
    const existingStudent = await Student.findOne({ studentCode });
    if (existingStudent) {
      res.status(400);
      throw new Error("Mã học sinh đã tồn tại");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: "student",
      status: "active"
    });

    // Create Student profile
    const student = await Student.create({
      userId: user._id,
      studentCode,
      dateOfBirth,
      gender,
      parentIds: parentIds || [],
      emergencyContact
    });

    res.status(201).json({
      message: "Tạo học sinh thành công",
      student: {
        ...student.toObject(),
        userId: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Lấy danh sách học sinh
 * @route   GET /api/admin/students
 * @access  Private (Admin, Teacher)
 */
export const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find()
        .populate("userId", "fullName email phone status")
        .populate("parentIds", "fullName email phone")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Student.countDocuments(),
    ]);

    res.status(200).json({
      students,
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
 * @desc    Cập nhật thông tin học sinh
 * @route   PUT /api/admin/students/:id
 * @access  Private (Admin only)
 */
export const updateStudent = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, status,
      studentCode, dateOfBirth, gender, parentIds, emergencyContact
    } = req.body;

    const student = await Student.findById(req.params.id).populate("userId");
    if (!student) {
      res.status(404);
      throw new Error("Không tìm thấy học sinh");
    }

    // Update Student fields
    if (studentCode) student.studentCode = studentCode;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (gender) student.gender = gender;
    if (parentIds) student.parentIds = parentIds;
    if (emergencyContact) student.emergencyContact = emergencyContact;
    await student.save();

    // Update User fields
    const user = await User.findById(student.userId._id);
    if (user) {
      if (fullName) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (status) user.status = status;
      // We generally don't allow changing email to avoid conflicts, or handle it carefully
      await user.save();
    }

    res.status(200).json({
      message: "Cập nhật học sinh thành công",
      student: {
        ...student.toObject(),
        userId: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status }
      }
    });
  } catch (error) {
    next(error);
  }
};
