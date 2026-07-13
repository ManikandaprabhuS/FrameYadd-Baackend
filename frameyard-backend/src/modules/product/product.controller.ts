import { Request, Response } from "express";
import multer from "multer";
import { Parser } from "json2csv";
import { createProduct, createVariant, deleteVariant,deleteProduct as deleteProductService,
  getAllProducts, getProductById, updateProduct, updateVariant, getInventoryForExport } from "./product.service";

interface ProductParams {
  productId: string;
}
interface ProductIdParams {
  id: string;
}

interface VariantParams {
  variantId: string;
}

import {
  uploadProductImages,
} from "./product.storage";


export const fetchProducts = async (
  req: Request,
  res: Response
) => {

  const result =
    await getAllProducts();

  return res.status(200).json(result);
};

export const fetchProductById = async (
  req: Request<ProductIdParams>,
  res: Response
) => {

  const result =
    await getProductById(req.params.id);

  return res.status(200).json(result);
};

export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  const productId =String(req.params.id);

const result = await deleteProductService(
    productId
  );

  if (!result.success) {
    return res.status(404).json(result);
  }
  return res.status(200).json(result);
};

export const editProduct = async (
  req: Request,
  res: Response
) => {
  const productId = String(req.params.id);
  const result =
    await updateProduct(
      productId,
      req.body
    );

  return res.status(200).json(result);
};

export const editVariant = async (
  req: Request,
  res: Response
) => {

  const variantId = String(req.params.variantId);
  const result =
    await updateVariant(
      variantId,
      req.body
    );

  return res.status(200).json(result);
};

export const removeVariant = async (
  req: Request,
  res: Response
) => {
  const variantId = String(req.params.variantId);
  const result =
    await deleteVariant(
      variantId
    );

  return res.status(200).json(result);
};

export const addProduct = async (
  req: Request,
  res: Response
) => {

  const result =
    await createProduct(req.body);
  return res.status(200).json(result);
};

export const addVariant = async (
  req: Request,
  res: Response
) => {

  const productId = String(req.params.productId);

  const result = await createVariant(
    productId,
    req.body
  );
  return res.status(200).json(result);
};

export const exportInventory = async (
  req: Request,
  res: Response
) => {
  const products = await getInventoryForExport();
  const rows = products.flatMap((product) =>
    product.variants.map((variant) => ({
      ProductName: product.name,
      Material: product.material,
      Colors: product.availableColors?.join(", "),
      FrameSize: variant.frameSize,
      Price: variant.price,
      OfferPrice: variant.offerPrice,
      StockQuantity: variant.stockQuantity,
      Active: product.isActive,
    }))
  );
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header("Content-Type", "text/csv");
  res.attachment(`inventory-${Date.now()}.csv`);
  return res.send(csv);
};


export const uploadImages = async (
  req: Request,
  res: Response
) => {

  try {
    const files =req.files as Express.Multer.File[];
    console.log("REQ FILE =", req.file);
console.log("REQ FILES =", req.files);
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Files required",
      });

    }
    console.log("FILES =", files);
    console.log("IS ARRAY =", Array.isArray(files));
    console.log("FILES LENGTH =", files?.length);

    const imageUrls =await uploadProductImages(files);
    return res.json({success: true, images: imageUrls,});
  } catch (error: any) {
    const isUploadError = error instanceof multer.MulterError;
    const isValidationError =
      error?.message?.includes("Only JPG") ||
      error?.message?.includes("Supabase Storage rejected");

    return res.status(isUploadError || isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to upload images",
    });
  }
};
export { uploadProductImages };

