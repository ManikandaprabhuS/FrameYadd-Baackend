import { NextFunction, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "./auth.middleware";

export const authorizeRoles =
  (...roles: Array<"ADMIN" | "EMPLOYEE" | "CUSTOMER">) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
