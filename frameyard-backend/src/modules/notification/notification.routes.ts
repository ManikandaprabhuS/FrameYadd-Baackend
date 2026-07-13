import { Router } from "express";
import {
  getNotifications,
  markAllRead,
  toggleRead,
  deleteNotification,
} from "./notification.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.get("/", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), getNotifications);
router.put("/mark-all-read", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), markAllRead);
router.put("/:id/toggle", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), toggleRead);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), deleteNotification);

export default router;
