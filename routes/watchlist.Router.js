import express from "express";
import { authenticated } from "../middleware/authMiddleware.js";
import {
  addToWatchlist,
  removeFromWatchlist,
  watchlist,
} from "../controllers/watchlist.js";

const router = express.Router();

router.get("/", authenticated, watchlist);
router.post("/:id", authenticated, addToWatchlist);
router.delete("/:id", authenticated, removeFromWatchlist);

export default router;
