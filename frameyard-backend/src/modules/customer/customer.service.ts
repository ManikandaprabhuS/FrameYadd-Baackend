import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";

export const getAllCustomers = async (
  page: number = 1,
  limit: number = 10
) => {

  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
  orders: {
    orderBy: {
      createdAt: "desc",
    },

    include: {
      orderItems: {
        select: {
          id: true,
          productName: true,
          frameSize: true,
          mountType: true,
          glassType: true,
          quantity: true,
          price: true,
          subtotal: true,
        },
      },
    },
  },
},
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),
  ]);

  return {
    customers,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCustomerById = async (
  customerId: string
) => {

  const customer =
    await prisma.user.findFirst({
      where: {
        id: customerId,
        role: "CUSTOMER",
      },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            orderItems: true,
          },
        },
      },
    });

  return customer;
};

export const getCustomerByPhoneNumber = async (
  phoneNumber: string
) => {
  const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");
  const phoneConditions: Prisma.UserWhereInput[] = [
    {
      phoneNumber,
    },
    {
      phoneNumber: normalizedPhoneNumber,
    },
  ];

  if (normalizedPhoneNumber) {
    phoneConditions.push({
      phoneNumber: {
        contains: normalizedPhoneNumber,
      },
    });
  }

  return prisma.user.findFirst({
    where: {
      role: "CUSTOMER",
      OR: phoneConditions,
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
    },
  });
};
