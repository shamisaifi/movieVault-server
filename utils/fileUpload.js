import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowdTypes = /jpeg|jpg|png/;

  const isImage = allowdTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  const mimeType = allowdTypes.test(file.mimetype);

  if (isImage && mimeType) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
