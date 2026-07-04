import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeCustomer } from "../../middlewares/customer.middleware";
import { changeOrderStatus, checkout, exportOrders, fetchAllOrders, fetchMyOrders, fetchOrderById } from "./order.controller";
import { authorizeAdmin } from "../../middlewares/admin.middleware";

const router = Router();

router.post("/checkout",authenticateUser,authorizeCustomer,checkout);
router.get("/",authenticateUser,authorizeCustomer,fetchMyOrders);
router.get("/admin",authenticateUser,authorizeAdmin,fetchAllOrders);
router.get("/admin/export",authenticateUser,authorizeAdmin,exportOrders);
router.patch("/admin/:id/status",authenticateUser,authorizeAdmin,changeOrderStatus);
router.get("/:id",authenticateUser, authorizeCustomer,fetchOrderById);

export default router;
