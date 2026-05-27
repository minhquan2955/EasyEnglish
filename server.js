import { env } from "./backend/src/config/env.js"; // Phải đưa lên đầu tiên để check biến môi trường ngay lập tức
import express from "express";
import connectDB from "./backend/src/config/db.js";
import {
  notFound,
  errorHandler,
} from "./backend/src/middlewares/error.middleware.js";
import authRoutes from "./backend/src/routes/auth.routes.js";
import registrationRoutes from "./backend/src/routes/registration.routes.js";
import adminRoutes from "./backend/src/routes/admin.routes.js";
import courseRoutes from "./backend/src/routes/course.routes.js";
import classRoutes from "./backend/src/routes/class.routes.js";
import enrollmentRoutes from "./backend/src/routes/enrollment.routes.js";
import scheduleRoutes from "./backend/src/routes/schedule.routes.js";
import { autoCompleteExpiredSchedules } from "./backend/src/services/schedule.service.js";
import attendanceRoutes from "./backend/src/routes/attendance.routes.js";
const app = express();

// Middleware để parse body dưới dạng JSON
app.use(express.json());

// Kết nối với Database
connectDB();

// Basic route test
app.get("/", (req, res) => {
  res.send("EasyEnglish API is running...");
});
//Auth routes
app.use("/api/auth", authRoutes);
// Admin routes
app.use("/api/admin", adminRoutes);
// Registration routes (đăng ký tư vấn)
app.use("/api/registrations", registrationRoutes);
// Course routes (quản lý khóa học)
app.use("/api/courses", courseRoutes);
// Class routes (quản lý lớp học)
app.use("/api/classes", classRoutes);
// Enrollment routes (ghi danh học sinh vào lớp)
app.use("/api/enrollments", enrollmentRoutes);
// Schedule routes (thời khóa biểu — quản lý từng buổi học)
app.use("/api/schedules", scheduleRoutes);
// Attendance routes (điểm danh)
app.use("/api/attendances", attendanceRoutes);
// Middleware xử lý lỗi (phải được đặt ở cuối cùng, sau các routes để bắt lỗi khi lỗi xảy ra ở các routes)
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);

  // --- Scheduled Task: Tự động hoàn tất buổi học đã hết giờ ---
  // Chạy lần đầu ngay khi server khởi động
  autoCompleteExpiredSchedules();
  // Sau đó chạy lặp lại mỗi 5 phút
  // setInterval(callback, delay)
  setInterval(autoCompleteExpiredSchedules, 5 * 60 * 1000);
  console.log("[Auto-Complete] Tác vụ định kỳ đã được kích hoạt (mỗi 5 phút)");
});
