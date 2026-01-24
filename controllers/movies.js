import { json } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Movie } from "../models/Movie.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";
import { Review } from "../models/Review.js";

export const movies = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.genre) {
    query.genre = req.query.genre.toLowerCase();
  }

  const movies = await Movie.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("title genre poster releaseYear");

  const totalMovies = await Movie.countDocuments(query);

  res.status(200).json({
    success: true,
    message: "all movies",
    page,
    totalPages: Math.ceil(totalMovies / limit) || 1,
    totalMovies,
    data: movies,
  });
});

export const searchMovie = asyncHandler(async (req, res, next) => {
  const { q = "", limit, page } = req.query;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 20);
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (q) {
    query.$text = { $search: q };
  }

  const movies = await Movie.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(20)
    .select("title genre poster releaseYear");

  res.status(200).json({
    success: true,
    message: "All movies",
    results: movies.length,
    data: movies,
  });
});

export const movie = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const movie = await Movie.findById(id).select("-__v");

  if (!movie) {
    return next(new AppError("Movie not found", 404));
  }

  res.status(200).json({
    success: true,
    data: movie,
  });
});

export const createMovie = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    releaseYear,
    genre,
    director,
    duration,
    cast = [],
  } = req.body;

  if (!title || !description || !releaseYear || !genre) {
    return next(new AppError("Required fields missing", 400));
  }

  const movieData = {
    title,
    description,
    releaseYear,
    genre,
    director,
    duration,
    cast,
  };

  if (req.file) {
    movieData.poster = `${process.env.BASE_URL}/${req.file.path}`;
  }

  const movie = await Movie.findOne({ $text: { $search: title } });

  if (movie) {
    return next(new AppError("movie already exist", 400));
  }

  const newMovie = await Movie.create(movieData);

  res.status(201).json({
    success: true,
    message: "moview created",
    data: {
      id: newMovie._id,
      title: newMovie.title,
      genre: newMovie.genre,
      director: newMovie.director,
    },
  });
});

export const updateMovie = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = {};
  const allowedFields = [
    "title",
    "description",
    "releaseYear",
    "genre",
    "director",
    "duration",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Array.isArray(req.body.cast) && req.body.cast.length > 0) {
    updates.$addToSet = { cast: { $each: req.body.cast } };
  }

  if (req.file) {
    updates.poster = `${process.env.BASE_URL}/${req.file.path}`;
  }

  const movie = await Movie.findByIdAndUpdate(
    id,
    { updates },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!movie) {
    return next(new AppError("Movie not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "updated",
    data: movie,
  });
});

export const deleteMovie = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const movie = await Movie.findByIdAndDelete(id);

  if (!movie) {
    return next(new AppError("Movie not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Movie deleted",
  });
});

export const uploadPoster = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!req.file) {
    return next(new AppError("poster not found to found", 404));
  }

  const filename = `${process.env.BASE_URL}/${req.file.path}`;
  const movie = await Movie.findByIdAndUpdate(
    id,
    { poster: filename },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    message: "poster uploaded",
    data: {
      title: movie.title,
      poster: movie.poster,
    },
  });
});

export const stats = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invlid movie id", 400));
  }

  const movie = await Movie.findById(id);

  res.json({
    success: true,
    message: "Movie stats",
    data: {
      title: movie.title,
      totalReviews: movie.stats.totalReviews,
      averageRating: movie.stats.averageRating,
      totalLikes: movie.stats.totalLikes,
      ratingDistribution: movie.stats.ratingDistribution,
    },
  });
});
