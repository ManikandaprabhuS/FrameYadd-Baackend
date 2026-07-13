import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";
import { supabaseAuth } from "../config/supabase";
import prisma from "../config/prisma";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;
  const token = bearerToken || req.cookies?.fy_access_token;

if (!token) {
  return res.status(401)
    .json({
      success:false,
      message:"Access token missing",
    });
}
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isActive: true },
  });

  if (!appUser || !appUser.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is inactive",
    });
  }

  req.user = user;
  next();

};

