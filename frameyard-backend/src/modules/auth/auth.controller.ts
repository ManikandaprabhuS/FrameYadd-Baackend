import { Request, Response } from "express";
import { adminLoginUser, getProfile, loginUser, registerUser, updateProfile } from "./auth.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const register = async (
  req: Request,
  res: Response
) => {
  const result = await registerUser(req.body);
  return res.status(200).json(result);
};

export const adminLogin = async (
  req: Request,
  res: Response
) => {

  const result =await adminLoginUser(req.body);
  console.log("===== LOGIN REQUEST =====");
console.log("Origin:", req.headers.origin);
console.log("User-Agent:", req.headers["user-agent"]);
console.log("Email:", req.body.email);

  if (
    !result.success ||
    !result.session?.access_token
  ) {
    return res.status(401).json(result);
  }
const isProduction = process.env.NODE_ENV === "production";
res.cookie("fy_access_token", result.session.access_token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
console.log("NODE_ENV =", process.env.NODE_ENV);
  // res.cookie(
  //   "fy_access_token",result.session.access_token,
  //   {
  //     httpOnly: true,
  //     //secure: false,
  //     secure:
  //       process.env.NODE_ENV ==="production",
  //      sameSite: "lax",
  //     //sameSite: "none",
  //     maxAge:
  //       7 * 24 * 60 * 60 * 1000,
  //   }
  // );

console.log("SET COOKIE =", {
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  origin: req.headers.origin,
});

  return res.status(200).json({
    success: true,
    user: result.user,
    message: result.message,
  });
};

export const login = async (
  req: Request,
  res: Response
) => {
  const result = await loginUser(req.body);
  return res.status(200).json(result);
};

export const profile = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await getProfile(
    req.user!.id
  );
  return res.status(200).json(result);
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await updateProfile(
    req.user!.id,
    req.body
  );
  return res.status(200).json(result);
};