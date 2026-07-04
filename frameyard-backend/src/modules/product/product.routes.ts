import { Router } from "express";
import { addProduct, addVariant, editProduct, editVariant, fetchProductById, 
    fetchProducts, removeVariant, exportInventory,
    uploadImages} from "./product.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { authorizeAdmin } from "../../middlewares/admin.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post("/uploadProductImages", authenticateUser, authorizeAdmin,upload.array("images", 10), uploadImages);
router.post("/addProduct", authenticateUser, authorizeAdmin, addProduct);
router.post("/:productId/variants", authenticateUser, authorizeAdmin, addVariant);
router.get("/", fetchProducts);
router.get("/export",authenticateUser,authorizeAdmin,exportInventory);
router.get("/:id", fetchProductById);
router.put("/:id", authenticateUser, authorizeAdmin, editProduct);
router.put("/variants/:variantId", authenticateUser, authorizeAdmin, editVariant);
router.delete("/variants/:variantId", authenticateUser, authorizeAdmin, removeVariant);

export default router;