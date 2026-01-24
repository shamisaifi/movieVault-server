import express from "express";
import { authenticated, authorize } from "../middleware/authMiddleware.js";
import {
  createMovie,
  deleteMovie,
  movie,
  movies,
  searchMovie,
  stats,
  updateMovie,
  uploadPoster,
} from "../controllers/movies.js";
import { upload } from "../utils/fileUpload.js";

const router = express.Router();

router.get("/", movies);
router.get("/search", searchMovie);
router.get("/:id", movie);
router.post(
  "/",
  authenticated,
  authorize("admin"),
  upload.single("poster"),
  createMovie,
);
router.put(
  "/:id",
  authenticated,
  authorize("admin"),
  upload.single("poster"),
  updateMovie,
);
router.put("/:id", authenticated, authorize("admin"), deleteMovie);
router.post(
  "/:id/poster",
  authenticated,
  authorize("admin"),
  upload.single("poster"),
  uploadPoster,
);
router.get("/:id/stats", authenticated, stats);

export default router;
