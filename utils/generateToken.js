import jwt from "jsonwebtoken";
import { AppError } from "./AppError.js";

export const generateAccessToken = (user) => {
  if (!user) {
    return next(new AppError("no user found", 404));
  }

  const payload = {
    id: user._id,
    role: user.role,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

export const generateRefreshToken = (user) => {
  if (!user) {
    return next(new AppError("no user found", 404));
  }

  const payload = {
    id: user._id,
    type: "refres",
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};
