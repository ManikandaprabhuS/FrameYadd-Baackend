import { Router } from "express";
import {  adminLogin, login, profile, register, updateUserProfile } from "./auth.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { loginLimiter } from "../../middlewares/rateLimit.middleware";


const router = Router();

router.post("/register",loginLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/admin/login", loginLimiter,adminLogin);
router.get("/profile", authenticateUser, profile);
router.put("/profile",authenticateUser,updateUserProfile);

export default router;