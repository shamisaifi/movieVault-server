import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { AppError } from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "../utils/cloudinary.js";


export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Invalid or missing form data", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: req.ip,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    accessToken,
    data: {
      id: { id: user._id, name: user.name },
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: req.ip,
  });

  res.cookie("refreshToken", refreshToken, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const refresh = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError("refresh token not found", 404));
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    user: decoded.id,
  });

  if (!storedToken) {
    return next(new AppError("Refresh token not found in database", 401));
  }

  if (storedToken.isRevoked) {
    return next(new AppError("Refresh token is revoked", 401));
  }

  if (new Date() > storedToken.createdAt) {
    return next(new AppError("Refresh token expired", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found", 401));
  }

  const newAccessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError("Refresh token not found", 401));
  }

  await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    {
      isRevoked: true,
      revokedAt: new Date(),
    },
  );

  res.clearCookie("refreshToken", getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const profile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).populate("reviews");

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  res.status(202).json({
    success: true,
    data: user,
  });
});


