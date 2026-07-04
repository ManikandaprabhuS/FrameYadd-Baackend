import { Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "./auth.middleware";

export const authorizeCustomer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.role !== "CUSTOMER") {
    return res.status(403).json({
      success: false,
      message: "Customer access required",
    });
  }

  next();
};