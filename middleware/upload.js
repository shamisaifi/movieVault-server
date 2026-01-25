import multer from "multer";
import path from "path";
import { AppError } from "../utils/AppError.js";

// ============================================
// MULTER CONFIGURATION (Temporary Storage)
// ============================================

// Store in memory (not disk) - more efficient for cloud upload
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedTypes = /jpeg|jpg|png|webp/;

  // Check extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  // Check MIME type
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept file
  } else {
    cb(new AppError("Only image files (JPEG, PNG, WEBP) are allowed", 400));
  }
};

// Multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});
