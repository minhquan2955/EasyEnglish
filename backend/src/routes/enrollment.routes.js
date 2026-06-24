import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
} from "../validations/enrollment.validation.js";
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
  getStudentsByClass,
  getChildrenEnrollments,
} from "../controllers/enrollment.controller.js";

const router = Router();

// Tất cả route cần đăng nhập
router.use(protect);

// ---- Routes cho Admin + Teacher (đọc) ----
router.get("/", authorize("admin", "teacher"), getEnrollments);

// ---- Route cho Parent (đọc) ----
router.get("/my-children", authorize("parent"), getChildrenEnrollments);

router.get("/:id", authorize("admin", "teacher"), getEnrollmentById);

// ---- Route đặc biệt: xem học sinh trong lớp ----
//Route này PHẢI đặt TRƯỚC "/:id" nếu dùng cùng pattern để không bị nhảy vào route /:id trước
// Nhưng ở đây pattern khác ("/class/:classId/students") nên không sao
router.get(
  "/class/:classId/students",
  authorize("admin", "teacher"),
  getStudentsByClass,
);

// ---- Routes chỉ Admin (tạo, sửa, xóa) ----
router.post(
  "/",
  authorize("admin"),
  validate(createEnrollmentSchema),
  createEnrollment,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(updateEnrollmentSchema),
  updateEnrollment,
);
router.delete("/:id", authorize("admin"), deleteEnrollment);

export default router;
