import multer from "multer";
import path from "path";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files are allowed", 400), false);
  }
  cb(null, true);
};

// Multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
