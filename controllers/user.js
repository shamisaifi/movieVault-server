import { asyncHandler } from "../middleware/asyncHandler.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import mongoose from "mongoose";

export const allUsers = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({ _id: { $ne: req.user.id } })
    .select("name avatar ")
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: users,
  });
});

export const userProfile = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-__v");

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const reviews = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ user: { $in: userId } })
    .populate({
      path: "movie",
      select: "title poster",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalReview = await Review.countDocuments({ user: userId });

  res.status(200).json({
    success: true,
    message: "all reviews",
    page,
    totalPages: Math.ceil(totalReview / limit),
    totalReview,
    data: reviews,
  });
});

export const toggleFollow = asyncHandler(async (req, res, next) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  if (targetUserId === currentUserId) {
    return next(new AppError("you can not follow/unfollow yourself"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new AppError("user not found", 404);
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { following: targetUserId } },
        { session },
      );

      await User.findByIdAndUpdate(
        targetUserId,
        { $pull: { followers: currentUserId } },
        { session },
      );
    } else {
      await User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: targetUserId } },
        { session },
      );

      await User.findByIdAndUpdate(
        targetUserId,
        { $addToSet: { followers: currentUserId } },
        { session },
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      followed: !isFollowing,
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

export const followers = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Invalid user id", 400));
  }

  const user = await User.findById(userId).select("followers");

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const userFollowers = await User.find({ _id: { $in: user.followers } })
    .select("name avatar")
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

  const totalFollowers = user.followers.length;
  const pageFollowers = userFollowers.length;
  const totalPages = Math.ceil(totalFollowers / limit);

  res.status(200).json({
    success: true,
    message: "followers list",
    page,
    totalPages,
    pageFollowers,
    totalFollowers,
    data: userFollowers,
  });
});

export const following = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError("Invalid user id", 400));
  }

  const user = await User.findById(userId).select("following");

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const userFollowing = await User.find({ _id: { $in: user.following } })
    .select("name avatar")
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

  const totalFollowing = user.following.length;
  const pageFollowing = userFollowing.length;
  const totalPages = Math.ceil(totalFollowing / limit);

  res.status(200).json({
    success: true,
    message: "followers list",
    page,
    totalPages,
    pageFollowing,
    totalFollowing,
    data: userFollowing,
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { name, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, bio },
    { new: true, runValidators: true },
  );

  if (!user) {
    return next(new AppError("user not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "updated",
    user,
  });
});

export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.avatar) {
    const oldPublicId = extractPublicId(user.avatar);
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }
  }

  const result = await uploadToCloudinary(
    req.file.buffer, // File buffer
    "movie-review/avatars", // Cloudinary folder
    `avatar-${user._id}-${Date.now()}`, // Custom filename
  );

  user.avatar = result.secure_url; // HTTPS URL
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar uploaded successfully",
    data: {
      avatar: user.avatar,
    },
  });
});

export const deleteAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Delete from Cloudinary
  if (user.avatar) {
    const publicId = extractPublicId(user.avatar);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  // Remove from database
  user.avatar = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar deleted successfully",
  });
});