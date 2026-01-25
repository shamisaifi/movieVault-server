import express from "express";
import { authenticated, authorize } from "../middleware/authMiddleware.js";
import {
  createMovie,
  deleteMovie,
  deletePoster,
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
  createMovie,
);
router.put(
  "/:id",
  authenticated,
  authorize("admin"),
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
router.delete("/:id/poster", authenticated, authorize("admin"), deletePoster);

export default router;
