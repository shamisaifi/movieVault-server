import { Review } from "../models/Review.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";
import { Movie } from "../models/Movie.js";

export const createReview = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const movieId = req.params.id;
  const { rating, reviewText, watchedDate } = req.body;

  if (rating == undefined || !reviewText) {
    return next(new AppError("All fields reuired", 400));
  }

  const movieExists = await Movie.exists({ _id: movieId });
  if (!movieExists) {
    return next(new AppError("Movie not found", 404));
  }

  try {
    const review = await Review.create({
      rating,
      reviewText,
      watchedDate,
      user: userId,
      movie: movieId,
    });

    res.status(201).json({
      success: true,
      message: "Movie reviewed",
      data: review,
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError("You can review a movie only once", 400));
    }
    throw err;
  }
});

export const reviews = asyncHandler(async (req, res, next) => {
  const movieId = req.params.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return next(new AppError("Invalid Movie id", 400));
  }

  const reviews = await Review.find({
    movie: movieId,
  })
    .populate([
      {
        path: "user",
        select: "name avatar",
      },
    ])
    .select("-movie")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReview = await Review.countDocuments({ movie: movieId });

  const formatted = reviews.map((review) => ({
    id: review._id,
    text: review.reviewText,
    rating: review.rating,
    likeCount: review.likeCount,
    user: {
      name: review.user.name,
      avatar: review.user.avatar,
    },
  }));

  res.status(200).json({
    success: true,
    message: "All reviews",
    page,
    totalPage: Math.ceil(totalReview / limit) || 1,
    totalReview,
    data: formatted,
  });
});

export const review = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid review id", 400));
  }

  const review = await Review.findById(id).populate({
    path: "user",
    select: "name avatar",
  });

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Movie review",
    data: review,
  });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { rating, reviewText, watchedDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid review id", 400));
  }

  const updates = {};
  if (req.body.rating !== undefined) updates.rating = req.body.rating;
  if (req.body.reviewText !== undefined)
    updates.reviewText = req.body.reviewText;
  if (req.body.watchedDate !== undefined)
    updates.watchedDate = req.body.watchedDate;

  const review = await Review.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    updates,
    { new: true, runValidators: true },
  );

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Review updated",
    data: review,
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const reviewId = req.params.id;

  const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Review deleted",
  });
});

export const addLike = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const reviewId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new AppError("Invalid review id"));
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  const likedReview = await review.addLike(userId);

  res.status(200).json({
    success: true,
    data: likedReview,
  });
});

export const removeLike = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const reviewId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new AppError("Invalid review id"));
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  const likedReview = await review.removeLike(userId);

  res.status(200).json({
    success: true,
    data: likedReview,
  });
});
