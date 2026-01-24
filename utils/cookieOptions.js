export const getCookieOptions = () => {
  return {
    // httpOnly: true,
    secure: false,
    // sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};
