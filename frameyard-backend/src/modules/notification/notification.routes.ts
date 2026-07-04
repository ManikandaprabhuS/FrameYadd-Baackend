import { Router } from "express";
import {
  getNotifications,
  markAllRead,
  toggleRead,
  deleteNotification,
} from "./notification.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeAdmin } from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authenticateUser, authorizeAdmin, getNotifications);
router.put("/mark-all-read", authenticateUser, authorizeAdmin, markAllRead);
router.put("/:id/toggle", authenticateUser, authorizeAdmin, toggleRead);
router.delete("/:id", authenticateUser, authorizeAdmin, deleteNotification);

export default router;
