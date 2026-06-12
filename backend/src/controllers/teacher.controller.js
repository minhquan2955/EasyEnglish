import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";

export const createTeacher = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, password,
      employeeCode, specializations, certifications, weeklySessionLimit, salary, joinDate
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã được sử dụng");
    }

    const existingTeacher = await Teacher.findOne({ employeeCode });
    if (existingTeacher) {
      res.status(400);
      throw new Error("Mã giáo viên đã tồn tại");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: "teacher",
      status: "active"
    });

    const teacher = await Teacher.create({
      userId: user._id,
      employeeCode,
      specializations: specializations || [],
      certifications: certifications || [],
      weeklySessionLimit,
      salary,
      joinDate
    });

    res.status(201).json({
      message: "Tạo giáo viên thành công",
      teacher: {
        ...teacher.toObject(),
        userId: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [teachers, total] = await Promise.all([
      Teacher.find()
        .populate("userId", "fullName email phone status")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Teacher.countDocuments(),
    ]);

    res.status(200).json({
      teachers,
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

export const updateTeacher = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, status, // user fields + teacher status
      employeeCode, specializations, certifications, weeklySessionLimit, salary, joinDate
    } = req.body;

    const teacher = await Teacher.findById(req.params.id).populate("userId");
    if (!teacher) {
      res.status(404);
      throw new Error("Không tìm thấy giáo viên");
    }

    if (employeeCode) teacher.employeeCode = employeeCode;
    if (specializations) teacher.specializations = specializations;
    if (certifications) teacher.certifications = certifications;
    if (weeklySessionLimit) teacher.weeklySessionLimit = weeklySessionLimit;
    if (salary) teacher.salary = salary;
    if (joinDate) teacher.joinDate = joinDate;
    if (status) teacher.status = status; // teacher has its own status
    await teacher.save();

    const user = await User.findById(teacher.userId._id);
    if (user) {
      if (fullName) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (status === 'inactive') user.status = 'inactive';
      else user.status = 'active'; // sync status
      await user.save();
    }

    res.status(200).json({
      message: "Cập nhật giáo viên thành công",
      teacher: {
        ...teacher.toObject(),
        userId: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status }
      }
    });
  } catch (error) {
    next(error);
  }
};
