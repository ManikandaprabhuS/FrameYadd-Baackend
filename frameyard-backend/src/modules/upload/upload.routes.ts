import { Router } from "express";
import multer from "multer";
import { uploadPhoto } from "./upload.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/photo", authenticateUser, upload.single("photo"), uploadPhoto);

export default router;
