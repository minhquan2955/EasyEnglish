import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUser,
} from "../controllers/user.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { createStudent, getStudents, updateStudent } from "../controllers/student.controller.js";
import { createTeacher, getTeachers, updateTeacher } from "../controllers/teacher.controller.js";
import { createParent, getParents, updateParent } from "../controllers/parent.controller.js";
import { generateSchedule, getAllSchedules, getSchedulesByClass, updateSchedule } from "../controllers/schedule.controller.js";

const router = Router();

// Tất cả route trong file này đều cần: đăng nhập + role admin
// Áp dụng protect + authorize cho toàn bộ router (thay vì viết lặp từng dòng)
router.use(protect, authorize("admin"));

// Quản lý Users
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.put("/users/:id/status", updateUserStatus);

// Tạo tài khoản theo role
router.post("/teachers", createTeacher);
router.post("/students", createStudent);
router.post("/parents", createParent);

// Lấy danh sách
router.get("/teachers", getTeachers);
router.get("/students", getStudents);
router.get("/parents", getParents);

// Cập nhật
router.put("/teachers/:id", updateTeacher);
router.put("/students/:id", updateStudent);
router.put("/parents/:id", updateParent);

// Lịch học (Schedule)
router.post("/schedules/generate", generateSchedule);
router.get("/schedules", getAllSchedules);
router.get("/schedules/class/:classId", getSchedulesByClass);
router.put("/schedules/:id", updateSchedule);

// Dashboard
router.get("/dashboard-stats", getDashboardStats);

export default router;
