import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import helmet from "helmet";
import ratelimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import cookieParser from "cookie-parser";
import "./models/User.js";
import "./models/Review.js";
import "./models/Movie.js";

const apiLimit = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "too many request please try later",
});

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors("*"));
// app.use(helmet());
app.use("/uploads", express.static("uploads"));

// Routers
import authRouter from "./routes/auth.Router.js";
import userRouter from "./routes/user.Router.js";
import movieRouter from "./routes/movie.Router.js";
import reviewRouter from "./routes/review.Router.js";
import watchlistRouter from "./routes/watchlist.Router.js";

app.use("/api/v1/auth", apiLimit, authRouter);
app.use("/api/v1/users", apiLimit, userRouter);
app.use("/api/v1/movie", apiLimit, movieRouter);
app.use("/api/v1/review", apiLimit, reviewRouter);
app.use("/api/v1/watchlist", apiLimit, watchlistRouter);

app.get("/", (req, res) => res.status(200).json({ success: true }));

// 404 handler
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// global error handler (LAST)
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
