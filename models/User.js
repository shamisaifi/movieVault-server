import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      min: 8,
      max: 15,
      select: false,
    },

    bio: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],

    stats: {
      reviewCount: { type: Number, default: 0 },
      followerCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
      watchlistCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// index
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });

// virtauls
userSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "user",
});

// pre
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// methods
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function (payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const User = mongoose.model("User", userSchema);
