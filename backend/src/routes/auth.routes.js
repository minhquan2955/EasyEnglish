import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { register, login, getMe, getMyProfile } from "../controllers/auth.controller.js";

const router = Router();

//Public routes
router.post("/register", register);
router.post("/login", login);

//Protected routes
router.get("/me", protect, getMe);
router.get("/me/profile", protect, getMyProfile);

export default router;
