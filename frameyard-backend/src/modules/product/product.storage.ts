import { supabase } from "../../config/supabase";
import crypto from "crypto";

export const uploadProductImage =
  async (
    file: Express.Multer.File
  ) => {
    const extension =file.originalname.split(".").pop();
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
      await supabase.storage
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
  throw new Error(error.message);
}
    const {
      data,
    } = supabase.storage
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