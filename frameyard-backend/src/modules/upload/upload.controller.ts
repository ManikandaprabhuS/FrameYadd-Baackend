import { Response } from "express";
import { uploadCustomerPhoto } from "./upload.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const userId = req.user?.id; // Assuming authenticateUser middleware attaches user
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await uploadCustomerPhoto(req.file, userId);

  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
};
