import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import {
  getTuitionList,
  recordPayment,
  getPaymentHistory,
  getMyPayments,
} from "../controllers/tuition.controller.js";

const router = Router();

// Admin routes
router.get("/admin", protect, authorize("admin"), getTuitionList);
router.post("/admin/pay", protect, authorize("admin"), recordPayment);
router.get(
  "/admin/history/:studentId/:classId",
  protect,
  authorize("admin"),
  getPaymentHistory
);

// Student / Parent routes
router.get(
  "/my-payments",
  protect,
  authorize("student", "parent"),
  getMyPayments
);

export default router;
