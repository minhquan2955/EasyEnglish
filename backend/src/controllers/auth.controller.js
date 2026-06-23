import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Student from "../models/Student.js"
import Teacher from "../models/Teacher.js"
import Parent from "../models/Parent.js"
import Enrollment from "../models/Enrollment.js"
import { generateToken } from "../utils/jwt.js"


/**
 * @description Dang ky nguoi dung moi
 * @route POST /api/auth/register
 * @access Public
 */

export const register = async (req, res, next) => {
    try {
        const {email, password, fullName, phone, role} = req.body;

        //kiem tra email
        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400);
            throw new Error("Email đã được sử dụng");
        }

        //Bam mat khau truoc khi luu DB
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        //Tao user
        const user = await User.create({
            email,
            passwordHash,
            fullName,
            phone,
            role: role || "student"
        })

        //Tao JWT token va tra cho client
        const token = generateToken({userId: user._id, role: user.role});
        res.status(201).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            token
        })
    } catch (error) {
        next(error);
    }
}

/**
 * @description Dang nhap
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req,res,next) => {
    try {
        const {email, password} = req.body;

        //Tim user theo email
        const user = await User.findOne({email});
        if(!user) {
            res.status(401);
            throw new Error("Email hoặc mật khẩu không đúng");
        }

        //Kiem tra tai khoan co bi khoa khong
        if(user.status !== "active") {
            res.status(403);
            throw new Error("Tài khoản đã bị khóa. Hãy liên hệ quản trị viên");
        }

        //Kiem tra mat khau trong DB
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) {
            res.status(401);
            throw new Error("Email hoặc mật khẩu không đúng")
        }

        //Tao JWT Token va tra ve
        const token = generateToken({userId: user._id, role: user.role});

        res.json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            phone: user.phone,
            token
        })
    } catch (error) {
        next(error);
    }
}
/**
 * 
 * @description Lay thong tin nguoi dung hien tai
 * @route GET /api/auth/me
 * @access Private - can dang nhap
 */
export const getMe = async (req, res, next) => {
    try {
        // req.user da duoc gan auth.middleware
        const user = await User.findById(req.user.userId).select("-passwordHash");
        //select("-passwordHash"): loai bo truong passwordHash (không bao giờ gửi hash ra ngoài)

        if(!user){
            res.status(404);
            throw new Error("Không tìm thấy người dùng");
        }

        res.json(user);
    } catch(error) {
        next(error);
    }
}

/**
 * @description Lấy thông tin hồ sơ mở rộng theo role
 * @route GET /api/auth/me/profile
 * @access Private - cần đăng nhập
 */
export const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) {
            res.status(404);
            throw new Error("Không tìm thấy người dùng");
        }

        let profile = null;

        if (user.role === "student") {
            const studentProfile = await Student.findOne({ userId: user._id })
                .populate("parentIds", "fullName email phone");
            if (studentProfile) {
                // Fetch enrolled classes
                const enrollments = await Enrollment.find({
                    studentId: studentProfile._id,
                    status: "active"
                }).populate({ path: "classId", select: "classCode" }).select("classId");
                const enrolledClasses = enrollments
                    .filter(e => e.classId?.classCode)
                    .map(e => e.classId.classCode);
                profile = { ...studentProfile.toObject(), enrolledClasses };
            }
        } else if (user.role === "teacher") {
            profile = await Teacher.findOne({ userId: user._id });
        } else if (user.role === "parent") {
            profile = await Parent.findOne({ userId: user._id })
                .populate({
                    path: "studentIds",
                    populate: { path: "userId", select: "fullName email" }
                });
        }

        res.json({ user, profile });
    } catch (error) {
        next(error);
    }
}