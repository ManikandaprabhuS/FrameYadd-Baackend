import { supabaseAdmin } from "../../config/supabase";
import crypto from "crypto";

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
};

export const uploadProductImage =
  async (
    file: Express.Multer.File
  ) => {
    const extension =
      extensionByMimeType[file.mimetype] ||
      file.originalname.split(".").pop() ||
      "bin";
    const fileName =`${crypto.randomUUID()}.${extension}`;
    const filePath =`products/${fileName}`;
     console.log(
      "Uploading to bucket: product-images"
    );

    console.log(
      "File Path:",
      filePath
    );

    const { error } =
      await supabaseAdmin.storage
        .from("product-images")
        .upload(filePath,file.buffer,
          {contentType: file.mimetype,
          }
        );

console.log("UPLOAD RESULT ERROR:",error);
console.log("AFTER UPLOAD EXECUTED");

   if (error) {
  console.error(
    "SUPABASE STORAGE ERROR:",
    JSON.stringify(error, null, 2)
  );
  if (error.message.toLowerCase().includes("row-level security")) {
    throw new Error(
      "Supabase Storage rejected the upload with RLS. Set SUPABASE_SERVICE_ROLE_KEY on Render to the service_role key, not the anon key."
    );
  }
  throw new Error(error.message);
}
    const {
      data,
    } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(
        filePath
      );
    return data.publicUrl;
};

export const uploadProductImages =
  async (
    files: Express.Multer.File[]
  ) => {
    console.log(
      "STORAGE FILES ARRAY:",
      Array.isArray(files)
    );
    console.log(
      "STORAGE FILES:",
      files
    );
    return Promise.all(
      files.map((file) =>
        uploadProductImage(file)
      )
    );
};
