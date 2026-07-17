import { supabaseAdmin, supabaseAuth } from "../../config/supabase";
import prisma from "../../config/prisma";

const isPlaceholderEmployeePhone = (phoneNumber?: string | null) =>
  typeof phoneNumber === "string" && phoneNumber.startsWith("EMP-");

const sanitizeProfileUser = <T extends { phoneNumber: string | null; role: string }>(user: T) => ({
  ...user,
  phoneNumber:
    user.role === "EMPLOYEE" && isPlaceholderEmployeePhone(user.phoneNumber)
      ? ""
      : user.phoneNumber,
});

export const registerUser = async (data: any) => {
  const { name, email, phoneNumber, password } = data;
  const existingUser = await prisma.user.findFirst({
  where: {
    OR: [
      { email },
      { phoneNumber }
    ]
  }
});

if (existingUser) {
  return {
    success: false,
    message: "EmailId or PhoneNumber already exists, Please try some other EmailId and PhoneNumber"
  };
}
  const { data: authData, error } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const authUser = authData.user;

  const user= await prisma.user.create({
    data: {
      id: authUser!.id,
      name,
      email,
      phoneNumber,
    },
  });

  try {
    await prisma.notification.create({
      data: {
        title: "New User Registration",
        message: `${user.name} registered on ${new Date(user.createdAt).toLocaleDateString()} with email verification.`,
        type: "info",
      },
    });
  } catch (err) {
    console.error("Failed to create registration notification:", err);
  }

  return {
    success: true,
    message: "Registration successful",
    user,
  };
  
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const { data: authData, error } =
    await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const user = await prisma.user.findUnique({
  where: {
    email,
  },
});

if (!user) {
  return {
    success: false,
    message: "User profile not found",
  };
}

const authUser = authData.user;

if (authUser.email_confirmed_at && !user.isEmailVerified) {
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isEmailVerified: true,
    },
  });

  try {
    await prisma.notification.create({
      data: {
        title: "New Verified User Registration",
        message: `${updatedUser.name} registered on ${new Date(updatedUser.createdAt).toLocaleDateString()} has verified their email.`,
        type: "success",
      },
    });
  } catch (err) {
    console.error("Failed to create email verification notification:", err);
  }
}
  return {
    success: true,
    message: "Login successful",
    user,
    session: authData.session,
  };
};

export const getProfile = async (
  userId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  return {
    success: true,
    user: sanitizeProfileUser(user),
  };
};

export const updateProfile = async (
  userId: string,
  data: any
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
      phoneNumber: true,
    },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const nextPhoneNumber =
    typeof data.phoneNumber === "string" && data.phoneNumber.trim()
      ? data.phoneNumber.trim()
      : existingUser.phoneNumber;

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: data.name?.trim(),
      phoneNumber: nextPhoneNumber,
      addressLine: data.addressLine || null,
      postalCode: data.postalCode || null,
      cityName: data.cityName || null,
      stateName: data.stateName || null,
      countryName: data.countryName || null,
      gender: data.gender || null,
    },
  });

  return {
    success: true,
    message: "Profile updated successfully",
    user: sanitizeProfileUser(updatedUser),
  };
};

export const changePassword = async (
  userId: string,
  password: string
) => {
  if (!password || password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters",
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Password updated successfully",
  };
};

export const adminLoginUser = async (data: any) => {
  const { email, password } = data;

  const { data: authData, error } =
    await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "User profile not found",
    };
  }

  if (!["ADMIN", "EMPLOYEE"].includes(user.role)) {
    return {
      success: false,
      message: "Access denied. Admin account required.",
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      message: "Account is inactive. Please contact an administrator.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return {
    success: true,
    message: "Admin login successful",
    user,
    session: authData.session,
  };
};
