import multer from "multer";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const upload =
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 8 * 1024 * 1024,
      files: 10,
    },
    fileFilter: (_req, file, cb) => {
      if (!allowedImageTypes.has(file.mimetype)) {
        cb(new Error("Only JPG, PNG, and WebP images are allowed"));
        return;
      }

      cb(null, true);
    },
  });
