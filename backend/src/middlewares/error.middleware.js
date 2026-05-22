// Middleware xử lý lỗi 404 (Không tìm thấy route)
export const notFound = (req, res, next) => {
  const error = new Error(`Route không tồn tại - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware xử lý lỗi chung (Bắt mọi lỗi từ next(error))
export const errorHandler = (err, req, res, next) => {
  // Nếu status code vẫn là 200 thì đổi thành 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Bắt lỗi đặc thù của Mongoose: Nếu truyền ID sai định dạng
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Không tìm thấy tài nguyên dữ liệu';
  }

  res.status(statusCode).json({
    message,
    // Chỉ hiển thị stack trace dài ngoằng khi ở môi trường development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
