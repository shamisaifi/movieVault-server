import express from "express";
import {
  login,
  logout,
  profile,
  refresh,
  register,
} from "../controllers/auth.js";
import { authenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", authenticated, refresh);
router.post("/logout", authenticated, logout);
router.get("/me", authenticated, profile);

export default router;
