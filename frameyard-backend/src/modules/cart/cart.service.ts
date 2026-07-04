import { GlassType, MountType } from "@prisma/client";
import prisma from "../../config/prisma";

export const addToCart = async (userId: string,data: any) => {

  const { variantId, quantity } = data;

  const variant =
    await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });

  if (!variant) {
    return {
      success: false,
      message: "Variant not found",
    };
  }

  if (variant.stockQuantity < quantity) {
    return {
      success: false,
      message: "Insufficient stock",
    };
  }

  let cart =
    await prisma.cart.findUnique({
      where: {
        userId,
      },
    });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  const existingItem =
    await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

  if (existingItem) {

    if (
      existingItem.quantity + quantity >
      variant.stockQuantity
    ) {
      return {
        success: false,
        message: "Insufficient stock",
      };
    }

    const updatedItem =
      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity:
            existingItem.quantity + quantity,
        },
      });

    return {
      success: true,
      message: "Cart updated successfully",
      item: updatedItem,
    };
  }

  const cartItem =
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
      },
    });

  return {
    success: true,
    message: "Item added to cart",
    item: cartItem,
  };
};

export const getCart = async (
  userId: string
) => {

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

  if (!cart) {
    return {
      success: true,
      items: [],
      total: 0,
    };
  }

  const items = cart.cartItems.map(
    (item) => {

      const price =
        Number(item.variant.offerPrice ??
        item.variant.price);

      return {
        cartItemId: item.id,

        productName:
          item.variant.product.name,

        variantId:
          item.variant.id,

        frameSize:
          item.variant.frameSize,

        MountType:
          item.variant.mountType,

        GlassType:
          item.variant.glassType,

        price,

        quantity:
          item.quantity,

        subtotal:
          price * item.quantity,
      };
    }
  );

  const total =
    items.reduce(
      (sum, item) =>
        sum + item.subtotal,
      0
    );

  return {
    success: true,
    items,
    total,
  };
};

export const updateCartItem = async (
  cartItemId: string,
  quantity: number
) => {

  const cartItem =
    await prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
      },
      include: {
        variant: true,
      },
    });

  if (!cartItem) {
    return {
      success: false,
      message: "Cart item not found",
    };
  }

  if (quantity <= 0) {
    return {
      success: false,
      message: "Quantity must be greater than 0",
    };
  }

  if (
    quantity >
    cartItem.variant.stockQuantity
  ) {
    return {
      success: false,
      message: "Insufficient stock",
    };
  }

  const updatedItem =
    await prisma.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        quantity,
      },
    });

  return {
    success: true,
    message: "Cart item updated successfully",
    item: updatedItem,
  };
};
export const removeCartItem = async (
  cartItemId: string
) => {

  const cartItem =
    await prisma.cartItem.findUnique({
      where: {
        id: cartItemId,
      },
    });

  if (!cartItem) {
    return {
      success: false,
      message: "Cart item not found",
    };
  }

  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  return {
    success: true,
    message: "Cart item removed successfully",
  };
};