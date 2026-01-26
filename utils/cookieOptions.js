
// production
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: true, // REQUIRED in production
  sameSite: "none", // REQUIRED for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

// ===================

//test
// export const getCookieOptions = () => ({
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//   maxAge: 7 * 24 * 60 * 60 * 1000,
//   path: "/",
// });

