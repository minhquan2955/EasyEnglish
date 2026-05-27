import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  bulkCheckInSchema,
  updateAttendanceSchema,
} from "../validations/attendance.validation.js";
import {
  bulkCheckInController,
  getAttendanceBySchedule,
  getAttendances,
  getAttendanceById,
  updateAttendance,
} from "../controllers/attendance.controller.js";

const router = Router();

// Tất cả route cần đăng nhập
router.use(protect);

// ---- Route đặc biệt (PHẢI đặt trước /:id) ----

// Điểm danh hàng loạt
router.post(
  "/bulk",
  authorize("admin", "teacher"),
  validate(bulkCheckInSchema),
  bulkCheckInController,
);

// Xem điểm danh theo buổi học
router.get(
  "/schedule/:scheduleId",
  authorize("admin", "teacher"),
  getAttendanceBySchedule,
);

// ---- CRUD ----
router.get("/", authorize("admin", "teacher"), getAttendances);
router.get("/:id", authorize("admin", "teacher"), getAttendanceById);
router.put(
  "/:id",
  authorize("admin", "teacher"),
  validate(updateAttendanceSchema),
  updateAttendance,
);

export default router;
