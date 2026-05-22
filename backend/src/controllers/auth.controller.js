import bcrypt from "bcryptjs"
import User from "../models/User.js"
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