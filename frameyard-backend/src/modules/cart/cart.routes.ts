import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeCustomer } from "../../middlewares/customer.middleware";
import { addItemToCart, fetchCart, removeCartItemController, updateCartItemController } from "./cart.controller";

const router = Router();

router.post("/items",authenticateUser,authorizeCustomer,addItemToCart);
router.get("/",authenticateUser,authorizeCustomer,fetchCart);
router.put("/items/:id",authenticateUser,authorizeCustomer,  updateCartItemController);
router.delete("/items/:id",authenticateUser,authorizeCustomer,removeCartItemController);

export default router;