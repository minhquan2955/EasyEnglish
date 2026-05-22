import { verifyToken } from "../utils/jwt.js";
/**
 * Middleware xác thực JWT
 * Kiểm tra token trong header Authorization, giải mã và gắn thông tin user vào req.user
 */

export const protect = (req, res, next) => {
    try {
        // 1. Lấy token từ header Authorization
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401);
            throw new Error("Vui lòng đăng nhập");
        }

        //2. Tách lấy token (bỏ "Bearer ")
        const token = authHeader.split(" ")[1]; //tách theo dấu " ", lấy phần tử sau Bearer

        //3. Xác thực token
        const decoded = verifyToken(token);
        //4. Giải mã token, gán thông tin user vào request
        req.user = decoded;
        
        //5.Cho request sang các middleware/controller khác
        next();
    } catch (error) {
        if(error.name === "TokenExpiredError") {
            res.status(401);
            next(new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"));
        } else if(error.name === "JsonWebTokenError") {
            res.status(401);
            next(new Error("Token không hợp lệ"))
        } else {
            next(error);
        }
    }
}