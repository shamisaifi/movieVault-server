import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    releaseYear: {
      type: Number,
      required: true,
    },

    genre: {
      type: String,
      enum: [
        "Action",
        "Comedy",
        "Drama",
        "Horror",
        "Romance",
        "Sci-Fi",
        "Thriller",
        "Animation",
        "Adventure",
        "Fantasy",
        "Crime",
        "Mystery",
      ],
      required: true,
    },

    director: String,

    cast: [String],

    duration: Number,

    poster: {
      type: String,
      default: "",
    },

    stats: {
      totalReviews: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      ratingDistribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ title: "text", description: "text", director: "text" });

movieSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "movie",
});

export const Movie = mongoose.model("Movie", movieSchema);
