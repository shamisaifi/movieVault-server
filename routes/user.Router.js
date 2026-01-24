import express from "express";
import { authenticated } from "../middleware/authMiddleware.js";
import {
  allUsers,
  followers,
  following,
  reviews,
  toggleFollow,
  userProfile,
} from "../controllers/user.js";

const router = express.Router();

router.get("/", authenticated, allUsers);
router.get("/:id", authenticated, userProfile);
router.get("/:id/reviews", authenticated, reviews);
router.post("/:id/toggleFollow", authenticated, toggleFollow);
router.get("/:id/followers", authenticated, followers);
router.get("/:id/following", authenticated, following);

export default router;
