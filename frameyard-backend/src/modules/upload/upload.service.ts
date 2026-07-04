import { supabase } from "../../config/supabase";

const BUCKET_NAME = "customer-photos";

export const uploadCustomerPhoto = async (
  file: Express.Multer.File,
  userId: string
): Promise<{ success: boolean; url?: string; message?: string }> => {
  const ext = file.originalname.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  const { data: publicData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return {
    success: true,
    url: publicData.publicUrl,
  };
};
