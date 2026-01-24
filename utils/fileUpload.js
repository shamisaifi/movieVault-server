import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fieldname = file.fieldname;
    let folder;

    if (fieldname === "avatar") {
      folder = "avatar";
    }
    if (fieldname === "poster") {
      folder = "poster";
    } else {
      return cb(new Error("Invalid upload field"));
    }

    cb(null, `uploads/${folder}/`);
  },

  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname).toLowerCase();
    const userId = req.user?.id || "system";
    const uniqueName = `${userId}-${Date.now()}${extname}`;
    cb(null, uniqueName);
  },
});

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});
