import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import {
  getUsers,
  getUserById,
  createTeacher,
  createStudent,
  createParent,
  updateUserStatus,
  linkParent,
} from "../controllers/user.controller.js";

const router = Router();

// Tất cả route trong file này đều cần: đăng nhập + role admin
// Áp dụng protect + authorize cho toàn bộ router (thay vì viết lặp từng dòng)
router.use(protect, authorize("admin"));

// Quản lý Users
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);

// Tạo tài khoản theo role
router.post("/teachers", createTeacher);
router.post("/students", createStudent);
router.post("/parents", createParent);

// Liên kết phụ huynh với học sinh
router.post("/students/:id/link-parent", linkParent);

export default router;
