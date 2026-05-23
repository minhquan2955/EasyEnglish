import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createClassSchema,
  updateClassSchema,
} from "../validations/class.validation.js";
import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controllers/class.controller.js";

const router = Router();

// Tất cả route cần đăng nhập
router.use(protect);

// ---- Routes cho Admin + Teacher (đọc) ----
router.get("/", authorize("admin", "teacher"), getClasses);
router.get("/:id", authorize("admin", "teacher"), getClassById);

// ---- Routes chỉ Admin (tạo, sửa, xóa) ----
router.post("/", authorize("admin"), validate(createClassSchema), createClass);
router.put(
  "/:id",
  authorize("admin"),
  validate(updateClassSchema),
  updateClass,
);
router.delete("/:id", authorize("admin"), deleteClass);

export default router;
