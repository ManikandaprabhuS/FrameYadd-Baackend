import { supabaseAuth } from "../../config/supabase";
import prisma from "../../config/prisma";

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
console.log("AUTH USER:", authUser);
console.log("EMAIL CONFIRMED:", authUser.email_confirmed_at);
console.log("Before Update:", user.isEmailVerified);

if (authUser.email_confirmed_at && !user.isEmailVerified) {
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isEmailVerified: true,
    },
  });
  console.log("After Update:", updatedUser.isEmailVerified);

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
    user,
  };
};

export const updateProfile = async (
  userId: string,
  data: any
) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: data.name,
      phoneNumber: data.phoneNumber,
      addressLine: data.addressLine,
      postalCode: data.postalCode,
      cityName: data.cityName,
      stateName: data.stateName,
      countryName: data.countryName,
      gender: data.gender,
    },
  });

  return {
    success: true,
    message: "Profile updated successfully",
    user: updatedUser,
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

  if (user.role !== "ADMIN") {
    return {
      success: false,
      message: "Access denied. Admin account required.",
    };
  }

  return {
    success: true,
    message: "Admin login successful",
    user,
    session: authData.session,
  };
};
