
import prisma from "../../config/prisma";

type OrderQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFilter?: string;
};

const buildOrderWhere = (
  query: OrderQuery = {},
  userId?: string
) => {
  const search = query.search?.trim();
  const status = query.status;
  const dateFilter = query.dateFilter;
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        user: {
          email: { contains: search, mode: "insensitive" },
        },
      },
      {
        phoneNumber: { contains: search, mode: "insensitive" },
      },
    ];
  }

  if (status && status !== "all") {
    where.orderStatus = status;
  }

  if (dateFilter && dateFilter !== "all") {
    const days = Number(dateFilter);
    if (!Number.isNaN(days) && days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      where.createdAt = {
        gte: since,
      };
    }
  }

  return where;
};

export const createOrder = async (
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
if (user.role !== "CUSTOMER") {
  return {
    success: false,
    message: "Only customers can place orders",
  };
}
  if (
    !user.phoneNumber ||
    !user.addressLine ||
    !user.postalCode ||
    !user.cityName ||
    !user.stateName ||
    !user.countryName
  ) {
    return {
      success: false,
      message: "Please complete your profile before placing an order",
    };
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      cartItems: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.cartItems.length === 0) {
    return {
      success: false,
      message: "Cart is empty",
    };
  }

  let totalAmount = 0;

  for (const item of cart.cartItems) {

    if (
      item.quantity >
      item.variant.stockQuantity
    ) {
      return {
        success: false,
        message: `Insufficient stock for ${item.variant.product.name}`,
      };
    }

    const price = Number(
      item.variant.offerPrice ??
      item.variant.price
    );

    totalAmount +=
      price * item.quantity;
  }
  const orderNumber = `FY-${Date.now().toString().slice(-8)}`;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber,
      totalAmount,
      phoneNumber: user.phoneNumber,
      addressLine: user.addressLine,
      postalCode: user.postalCode,
      cityName: user.cityName,
      stateName: user.stateName,
      countryName: user.countryName,
    },
  });

  for (const item of cart.cartItems) {

    const price = Number(
      item.variant.offerPrice ??
      item.variant.price
    );

    const subtotal =
      price * item.quantity;

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId:
          item.variant.product.id,
        variantId:
          item.variant.id,
        productName:
          item.variant.product.name,
        frameSize:
          item.variant.frameSize,
        mountType:
          item.variant.mountType,
        glassType:
          item.variant.glassType,
        price,
        quantity:
          item.quantity,
        subtotal,
      },
    });

    await prisma.productVariant.update({
      where: {
        id: item.variant.id,
      },
      data: {
        stockQuantity: {
          decrement:
            item.quantity,
        },
      },
    });
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  try {
    await prisma.notification.create({
      data: {
        title: "New Order Placed",
        message: `Order #${order.orderNumber} has been placed. Status: ${order.orderStatus}. Total Amount: $${order.totalAmount}`,
        type: "info",
      },
    });
  } catch (err) {
    console.error("Failed to create order notification:", err);
  }

  return {
    success: true,
    message: "Order placed successfully",
    orderId: order.id,
    orderNumber: order.orderNumber,
  };
};

export const getMyOrders = async (
  userId: string
) => {

  const orders =
    await prisma.order.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: true,
      },
    });

  return {
    success: true,
    orders,
  };
};

export const getOrderById = async (
  orderId: string,
  userId: string
) => {

  const order =
    await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: true,
      },
    });

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  return {
    success: true,
    order,
  };
};

export const getAllOrders = async (
  query: OrderQuery = {}
) => {
  return getPaginatedOrders(query);
};

export const getPaginatedOrders = async (
  query: OrderQuery = {}
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;
  const where = buildOrderWhere(query);

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({
      where,
    }),
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        orderItems: true,
      },
    }),
  ]);

  const [totalCount, pendingCount, processingCount, deliveredCount, cancelledCount] =
    await prisma.$transaction([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
      prisma.order.count({ where: { orderStatus: "PROCESSING" } }),
      prisma.order.count({ where: { orderStatus: "DELIVERED" } }),
      prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
    ]);

  return {
    success: true,
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    summary: {
      totalCount,
      pendingCount,
      processingCount,
      deliveredCount,
      cancelledCount,
    },
  };
};

export const exportAllOrders = async (
  query: OrderQuery = {}
) => {
  const where = buildOrderWhere(query);

  return prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
      orderItems: true,
    },
  });
};

export const updateOrderStatus = async (
  orderId: string,
  orderStatus: string
) => {

  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  const updatedOrder =
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: orderStatus as any,
      },
    });

  return {
    success: true,
    message: "Order status updated",
    order: updatedOrder,
  };
};
