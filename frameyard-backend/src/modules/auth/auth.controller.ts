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
  if (
    !result.success ||
    !result.session?.access_token
  ) {
    return res.status(401).json(result);
  }

  res.cookie(
    "fy_access_token",
    result.session.access_token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      maxAge:
        7 * 24 * 60 * 60 * 1000,
    }
  );

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