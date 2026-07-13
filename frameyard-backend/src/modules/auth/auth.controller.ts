import { Request, Response } from "express";
import { adminLoginUser, changePassword, getProfile, loginUser, registerUser, updateProfile } from "./auth.service";
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
    token: result.session.access_token,
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

export const logout = async (
  req: Request,
  res: Response
) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("fy_access_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
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
  try {
    const result = await updateProfile(
      req.user!.id,
      req.body
    );
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

export const changeUserPassword = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await changePassword(req.user!.id, req.body.password);
  return res.status(result.success ? 200 : 400).json(result);
};
