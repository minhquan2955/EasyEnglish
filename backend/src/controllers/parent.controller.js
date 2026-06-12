import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Parent from "../models/Parent.js";

export const createParent = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, password,
      studentIds, relationship
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
      role: "parent",
      status: "active"
    });

    const parent = await Parent.create({
      userId: user._id,
      studentIds: studentIds || [],
      relationship
    });

    res.status(201).json({
      message: "Tạo phụ huynh thành công",
      parent: {
        ...parent.toObject(),
        userId: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getParents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [parents, total] = await Promise.all([
      Parent.find()
        .populate("userId", "fullName email phone status")
        .populate({
          path: "studentIds",
          populate: { path: "userId", select: "fullName email" }
        })
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Parent.countDocuments(),
    ]);

    res.status(200).json({
      parents,
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

export const updateParent = async (req, res, next) => {
  try {
    const {
      fullName, email, phone, status,
      studentIds, relationship
    } = req.body;

    const parent = await Parent.findById(req.params.id).populate("userId");
    if (!parent) {
      res.status(404);
      throw new Error("Không tìm thấy phụ huynh");
    }

    if (studentIds) parent.studentIds = studentIds;
    if (relationship) parent.relationship = relationship;
    await parent.save();

    const user = await User.findById(parent.userId._id);
    if (user) {
      if (fullName) user.fullName = fullName;
      if (phone !== undefined) user.phone = phone;
      if (status) user.status = status;
      await user.save();
    }

    res.status(200).json({
      message: "Cập nhật phụ huynh thành công",
      parent: {
        ...parent.toObject(),
        userId: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, status: user.status }
      }
    });
  } catch (error) {
    next(error);
  }
};
