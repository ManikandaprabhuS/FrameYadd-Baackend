import { Request, Response, NextFunction } from "express";
import { User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

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
  const token = req.cookies?.fy_access_token || bearerToken;
   console.log("COOKIE TOKEN =", !!token);

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
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
  console.log("COOKIE TOKEN =", !!token);
console.log("COOKIE HEADER =", req.headers.cookie);
console.log("SUPABASE USER =", user?.email);
console.log("SUPABASE ERROR =", error);
console.log("COOKIES =", req.cookies);
console.log("AUTH =", req.headers.authorization);
  req.user = user;
  next();

};

