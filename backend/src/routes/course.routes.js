import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validations/course.validation.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

const router = Router();

// Tất cả route trong file này đều cần đăng nhập
router.use(protect);

// ---- Routes cho Admin + Teacher (đọc) ----
router.get("/", authorize("admin", "teacher"), getCourses);
router.get("/:id", authorize("admin", "teacher"), getCourseById);

// ---- Routes chỉ Admin (tạo, sửa, xóa) ----
router.post(
  "/",
  authorize("admin"),
  validate(createCourseSchema),
  createCourse,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(updateCourseSchema),
  updateCourse,
);
router.delete("/:id", authorize("admin"), deleteCourse);

export default router;
