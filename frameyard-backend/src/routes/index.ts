import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes"
import productRoutes from "../modules/product/product.routes";
import cartRoutes from "../modules/cart/cart.routes";
import orderRoutes from "../modules/order/order.routes";
import customerRoutes from "../modules/customer/customer.routes";
import uploadRoutes from "../modules/upload/upload.routes";
import notificationRoutes from "../modules/notification/notification.routes";
import employeeRoutes from "../modules/employee/employee.routes";

const router = Router();

router.use("/frameyard/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/customers", customerRoutes);
router.use("/upload", uploadRoutes);
router.use("/notifications", notificationRoutes);
router.use("/employees", employeeRoutes);
router.use("/admin/employees", employeeRoutes);

export default router;
