import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeCustomer } from "../../middlewares/customer.middleware";
import { changeOrderStatus, checkout, exportOrders, fetchAllOrders, fetchMyOrders, fetchOrderById } from "./order.controller";
import { authorizeRoles } from "../../middlewares/role.middleware";

const router = Router();

router.post("/checkout",authenticateUser,authorizeCustomer,checkout);
router.get("/",authenticateUser,authorizeCustomer,fetchMyOrders);
router.get("/admin",authenticateUser,authorizeRoles("ADMIN", "EMPLOYEE"),fetchAllOrders);
router.get("/admin/export",authenticateUser,authorizeRoles("ADMIN", "EMPLOYEE"),exportOrders);
router.patch("/admin/:id/status",authenticateUser,authorizeRoles("ADMIN", "EMPLOYEE"),changeOrderStatus);
router.get("/:id",authenticateUser, authorizeCustomer,fetchOrderById);

export default router;
