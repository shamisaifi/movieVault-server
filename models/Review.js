import mongoose from "mongoose";
import { User } from "./User.js";
import { Movie } from "./Movie.js";

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Movie",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    reviewText: {
      type: String,
      required: true,
    },

    watchedDate: Date,

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    likeCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// indexes
reviewSchema.index({ id: 1 });
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

// ___________methods____________

// when review created
reviewSchema.post("save", async function () {
  await User.findByIdAndUpdate(this.user, {
    $inc: { "stats.reviewCount": 1 },
  });

  await updateMovieStats(this.movie);
});

// when review deleted
reviewSchema.post("remove", async function () {
  await User.findByIdAndUpdate(this.user, {
    $inc: { "stats.reviewCount": -1 },
  });

  await updateMovieStats(this.movie);
});

// when like is added to review
reviewSchema.methods.addLike = async function (userId) {
  this.likes.push(userId);
  this.likeCount += 1;
  await this.save();
};

// when like is removed
reviewSchema.methods.removeLike = async function (userId) {
  this.likes.pull(userId);
  this.likeCount -= 1;
  await this.save();
};

async function updateMovieStats(movieId) {
  const stats = await Review.aggregate(
    {
      $match: { movie: movieId },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        totalLikes: { $sum: "$likeCount" },
        ratings: { $push: "$rating" },
      },
    },
  );

  if (stats.length > 0) {
    const { totalReviews, averageRating, totalLikes, ratings } = stats[0];

    const ratingDistribution = {
      5: ratings.filter((r) => r === 5).length,
      4: ratings.filter((r) => r === 4).length,
      3: ratings.filter((r) => r === 3).length,
      2: ratings.filter((r) => r === 2).length,
      1: ratings.filter((r) => r === 1).length,
    };

    await Movie.findByIdAndUpdate(movieId, {
      "stats.totalReviews": totalReviews,
      "stats.averageRating": Math.round(averageRating * 10) / 10,
      "stats.totalLikes": totalLikes,
      "stats.ratingDistribution": ratingDistribution,
    });
  }
}

export const Review = mongoose.model("Review", reviewSchema);
