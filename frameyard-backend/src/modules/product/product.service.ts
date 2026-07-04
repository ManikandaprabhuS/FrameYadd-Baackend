import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { supabase } from "../../config/supabase";

type ProductImageInput = {
  imageUrl: string;
  displayOrder: number;
};

type ProductPayload = {
  name: string;
  description?: string;
  material: string;
  availableColors: string[];
  isActive?: boolean;
  images?: ProductImageInput[];
};

const imageOrderSort = (
  images: ProductImageInput[] = []
) =>
  [...images].sort(
    (left, right) =>
      left.displayOrder - right.displayOrder
  );

const syncProductImages = async (
  tx: Prisma.TransactionClient,
  productId: string,
  images: ProductImageInput[] = []
) => {
  await tx.productImage.deleteMany({
    where: {
      productId,
    },
  });

  if (images.length === 0) {
    return;
  }

  await tx.productImage.createMany({
    data: imageOrderSort(images).map(
      (image, index) => ({
        productId,
        imageUrl: image.imageUrl,
        displayOrder:
          image.displayOrder ?? index + 1,
      })
    ),
  });
};

export const getAllProducts = async () => {

  const products =
    await prisma.product.findMany({
      include: {
        variants: true,
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    success: true,
    products,
  };
};

export const getProductById = async (
  productId: string
) => {

  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: true,
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

  if (!product) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  return {
    success: true,
    product,
  };
};

export const createProduct = async (
  data: ProductPayload
) => {

  const product = await prisma.$transaction(async (tx) => {
    const createdProduct = await tx.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        material: data.material,
        availableColors: data.availableColors,
        isActive: data.isActive ?? true,
      },
    });

    await syncProductImages(
      tx,
      createdProduct.id,
      data.images || []
    );

    return tx.product.findUnique({
      where: {
        id: createdProduct.id,
      },
      include: {
        variants: true,
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  });

  return {
    success: true,
    message: "Product created successfully",
    product
  };
};

export const createVariant = async (
  productId: string,
  data: any
) => {

  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

  if (!existingProduct) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  const variant =
    await prisma.productVariant.create({
      data: {
        productId,
        frameSize: data.frameSize,
        mountType: data.mountType,
        glassType: data.glassType,
        price: data.price,
        offerPrice: data.offerPrice,
        stockQuantity: data.stockQuantity,
        priceValidUntil: data.priceValidUntil,
      },
    });

  return {
    success: true,
    message: "Variant created successfully",
    variant,
  };
};

export const updateProduct = async (
  productId: string,
  data: ProductPayload
) => {

  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

  if (!existingProduct) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  const product = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        name: data.name,
        description: data.description ?? null,
        material: data.material,
        availableColors: data.availableColors,
        isActive: data.isActive ?? existingProduct.isActive,
      },
    });

    await syncProductImages(
      tx,
      updatedProduct.id,
      data.images || []
    );

    return tx.product.findUnique({
      where: {
        id: updatedProduct.id,
      },
      include: {
        variants: true,
        images: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });
  });

  return {
    success: true,
    message: "Product updated successfully",
    product,
  };
};

export const updateVariant = async (
  variantId: string,
  data: any
) => {

  const existingVariant =
    await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });

  if (!existingVariant) {
    return {
      success: false,
      message: "Variant not found",
    };
  }

  const variant =
    await prisma.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        frameSize: data.frameSize,
        mountType: data.mountType,
        glassType: data.glassType,
        price: data.price,
        offerPrice: data.offerPrice,
        stockQuantity: data.stockQuantity,
        priceValidUntil: data.priceValidUntil,
      },
    });

  return {
    success: true,
    message: "Variant updated successfully",
    variant,
  };
};

export const deleteVariant = async (
  variantId: string
) => {
  const existingVariant =
    await prisma.productVariant.findUnique({
      where: {
        id: variantId,
      },
    });

  if (!existingVariant) {
    return {
      success: false,
      message: "Variant not found",
    };
  }

  await prisma.productVariant.delete({
    where: {
      id: variantId,
    },
  });

  return {
    success: true,
    message: "Variant deleted successfully",
  };
};

export const deleteProduct = async (
  productId: string
) => {
  const existingProduct =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
      },
    });

  if (!existingProduct) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  const paths =
    existingProduct.images
      .map((image) => {

        const marker =
          "/product-images/";

        const index =
          image.imageUrl.indexOf(
            marker
          );

        if (index === -1) {
          return null;
        }

        return image.imageUrl.substring(
          index + marker.length
        );

      })
      .filter(Boolean) as string[];

  console.log(
    "FILES TO DELETE:",
    paths
  );

  if (paths.length > 0) {
    const { error } =
      await supabase.storage
        .from("product-images")
        .remove(paths);

    console.log(
      "DELETE STORAGE ERROR:",
      error
    );

  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  return {
    success: true,
    message: "Product deleted successfully",
  };
};

export const getInventoryForExport = async () => {
  return await prisma.product.findMany({
    include: {
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
