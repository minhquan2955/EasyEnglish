import { Router } from "express";
import {
  createRegistration,
  getRegistrations,
  updateRegistration,
} from "../controllers/registration.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";

const router = Router();

// Public — Phụ huynh gửi đăng ký (không cần đăng nhập)
router.post("/", createRegistration);

// Private — Admin xem và cập nhật (cần đăng nhập)
router.get("/", protect, authorize("admin"), getRegistrations);
router.put("/:id", protect, authorize("admin"), updateRegistration);

export default router;
