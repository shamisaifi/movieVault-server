import express from "express";
import {
  deleteAvatar,
  login,
  logout,
  profile,
  refresh,
  register,
  updateProfile,
  uploadAvatar,
} from "../controllers/auth.js";
import { authenticated } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", authenticated, refresh);
router.post("/logout", authenticated, logout);
router.get("/me", authenticated, profile);
router.put("/update-profile", authenticated, updateProfile);

router.post("/avatar", authenticated, upload.single("avatar"), uploadAvatar);

router.delete("/avatar", authenticated, deleteAvatar);

export default router;
