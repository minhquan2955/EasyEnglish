import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createScheduleSchema,
  updateScheduleSchema,
  generateScheduleSchema,
} from "../validations/schedule.validation.js";
import {
  generateSchedule,
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesByTeacher,
  getSchedulesByClass,
  deleteSchedulesByClassId,
} from "../controllers/schedule.controller.js";

const router = Router();

// Tất cả route cần đăng nhập
router.use(protect);

// ---- Sinh tự động lịch học ----
// Đặt TRƯỚC các route có /:id để tránh Express hiểu "generate" là một id
router.post(
  "/generate",
  authorize("admin"),
  validate(generateScheduleSchema),
  generateSchedule,
);

// ---- Convenience routes (đặt trước /:id) ----
router.get(
  "/teacher/:teacherId",
  authorize("admin", "teacher"),
  getSchedulesByTeacher,
);
router.get(
  "/class/:classId",
  authorize("admin", "teacher"),
  getSchedulesByClass,
);
router.delete("/class/:classId", authorize("admin"), deleteSchedulesByClassId);

// ---- CRUD cơ bản ----
router.get("/", authorize("admin", "teacher"), getSchedules);
router.get("/:id", authorize("admin", "teacher"), getScheduleById);

router.post(
  "/",
  authorize("admin"),
  validate(createScheduleSchema),
  createSchedule,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(updateScheduleSchema),
  updateSchedule,
);
router.delete("/:id", authorize("admin"), deleteSchedule);

export default router;
