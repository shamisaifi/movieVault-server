import express from "express";
import { authenticated } from "../middleware/authMiddleware.js";
import {
  allUsers,
  deleteAvatar,
  followers,
  following,
  reviews,
  toggleFollow,
  updateProfile,
  uploadAvatar,
  userProfile,
} from "../controllers/user.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", authenticated, allUsers);
router.get("/:id", authenticated, userProfile);
router.get("/:id/reviews", authenticated, reviews);
router.post("/:id/toggleFollow", authenticated, toggleFollow);
router.get("/:id/followers", authenticated, followers);
router.get("/:id/following", authenticated, following);
router.put("/update-profile", authenticated, updateProfile);
router.post("/avatar", authenticated, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", authenticated, deleteAvatar);

export default router;
