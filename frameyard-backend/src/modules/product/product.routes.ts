import { Router } from "express";
import { addProduct, addVariant, editProduct, editVariant, fetchProductById, 
    fetchProducts, removeVariant, exportInventory,uploadImages,deleteProduct} from "./product.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeRoles } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post("/uploadProductImages", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"),upload.array("images", 10), uploadImages);
router.post("/addProduct", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), addProduct);
router.post("/:productId/variants", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), addVariant);
router.get("/", fetchProducts);
router.get("/export",authenticateUser,authorizeRoles("ADMIN", "EMPLOYEE"),exportInventory);
router.get("/:id", fetchProductById);
router.put("/:id", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), editProduct);
router.put("/variants/:variantId", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), editVariant);
router.delete("/variants/:variantId", authenticateUser, authorizeRoles("ADMIN", "EMPLOYEE"), removeVariant);
router.delete("/:id",authenticateUser,authorizeRoles("ADMIN", "EMPLOYEE"),deleteProduct);

export default router;
