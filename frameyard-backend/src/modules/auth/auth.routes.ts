import { Router } from "express";
import {  adminLogin, changeUserPassword, login, logout, profile, register, updateUserProfile } from "./auth.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { loginLimiter } from "../../middlewares/rateLimit.middleware";


const router = Router();

router.post("/register",loginLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/admin/login", loginLimiter,adminLogin);
router.post("/logout", logout);
router.get("/profile", authenticateUser, profile);
router.put("/profile",authenticateUser,updateUserProfile);
router.patch("/password", authenticateUser, changeUserPassword);

export default router;
