import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createGradeSchema,
  updateGradeSchema,
} from "../validations/grade.validation.js";
import {
  createGrade,
  getGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  getGradesByStudent,
  getGradesByClass,
  getMyGrades,
  getChildrenGrades,
} from "../controllers/grade.controller.js";

const router = Router();

// Tất cả route cần đăng nhập
router.use(protect);

// ---- Convenience routes (PHẢI đặt trước /:id) ----
router.get("/my-grades", authorize("student"), getMyGrades);
router.get("/my-children", authorize("parent"), getChildrenGrades);

// Xem điểm 1 HS trong 1 lớp
router.get(
  "/student/:studentId/class/:classId",
  authorize("admin", "teacher"),
  getGradesByStudent,
);

// Xem bảng điểm cả lớp (có thể filter theo loại bài + tiêu đề)
router.get(
  "/class/:classId",
  authorize("admin", "teacher"),
  getGradesByClass,
);

// ---- CRUD cơ bản ----
router.get("/", authorize("admin", "teacher"), getGrades);
router.get("/:id", authorize("admin", "teacher"), getGradeById);

router.post(
  "/",
  authorize("admin", "teacher"),
  validate(createGradeSchema),
  createGrade,
);
router.put(
  "/:id",
  authorize("admin", "teacher"),
  validate(updateGradeSchema),
  updateGrade,
);

// Chỉ Admin mới được xóa điểm
router.delete("/:id", authorize("admin"), deleteGrade);

// ==================== BATCH EXAM ROUTES ====================
import { batchGradeSchema } from "../validations/grade.validation.js";
import { getExamsByClass, batchGradeExam } from "../controllers/grade.controller.js";

// Lấy danh sách các bài kiểm tra của một lớp
router.get("/class/:classId/exams", authorize("admin", "teacher"), getExamsByClass);

// Lưu điểm cho một bài kiểm tra
router.post(
  "/class/:classId/exam",
  authorize("admin", "teacher"),
  validate(batchGradeSchema),
  batchGradeExam
);

export default router;
