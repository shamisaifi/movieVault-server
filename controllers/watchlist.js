import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/User.js";
import { Movie } from "../models/Movie.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

export const watchlist = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid user Id", 400));
  }

  const user = await User.findById(id)
    .select("watchlist")
    .sort({ createdAt: -1 });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const watchlist = await Movie.find({
    _id: { $in: user.watchlist },
  }).select("title genre poster director releaseYear -_id");

  res.status(200).json({
    success: true,
    message: "user watchlist",
    data: watchlist,
  });
});

export const addToWatchlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return next(new AppError("Invalid movie id", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { watchlist: movieId } },
    { new: true },
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Movie added to watchlist",
    data: user.watchlist,
  });
});

export const removeFromWatchlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const movieId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return next(new AppError("Invalid movie id", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { watchlist: movieId } },
    { new: true },
  );

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Movie removed from watchlist",
    data: user.watchlist,
  });
});
