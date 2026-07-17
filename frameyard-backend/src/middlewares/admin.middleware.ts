import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { User } from "@supabase/supabase-js";

export interface AuthRequest
  extends Request {
  user?: User;
}

export const authorizeAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.id;

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

  if (user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};
