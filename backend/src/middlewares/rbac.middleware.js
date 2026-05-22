/**
 * 
 * @param  {...String} allowedRoles - danh sách các role đc phép 
 * @returns {Function} - chuyển sang 1 middleware khác
 */

export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user đã được gắn thông tin bới auth.middleware
        // req.user = { userId, role, iat, exp }

        if(!req.user) {
            res.status(401);
            return next(new Error("Vui lòng đăng nhập"));
        }

        if(!allowedRoles.includes(req.user.role)) {
            // role không có trong mảng role đc cấp phép
            res.status(403);
            return next(new Error("Bạn không có quyền truy cập"))
        }
        next();
    }
}