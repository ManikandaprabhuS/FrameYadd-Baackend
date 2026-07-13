import cors from "cors";
import "dotenv/config";
import app from "./app";
import cookieParser from "cookie-parser";
import multer from "multer";

const PORT = 5000;

app.use((req, res) => { res.status(404).json({
    success: false,    message: "Route not found",
  });
});

app.use(
  (
    err: any,
    req: any,
    res: any,
    next: any
  ) => {
    console.error(err);
    const isUploadError =
      err instanceof multer.MulterError ||
      err?.message?.includes("Only JPG");

    return res.status(isUploadError ? 400 : 500).json({success: false,
      message: isUploadError ? err.message : "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`); 
});
