import express from "express";
import { authenticated } from "../middleware/authMiddleware.js";
import {
  addLike,
  createReview,
  removeLike,
  review,
  reviews,
  updateReview,
} from "../controllers/review.js";

const router = express.Router();

router.post("/:id", authenticated, createReview);
router.get("/movie/:id", reviews);
router.get("/:id", review);
router.post("/:id/update", authenticated, updateReview);
router.post("/:id/like", authenticated, addLike);
router.post("/:id/unlike", authenticated, removeLike);

export default router;
